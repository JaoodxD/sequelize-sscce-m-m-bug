import { DataTypes, Model } from 'sequelize';
import { createSequelize6Instance } from '../setup/create-sequelize-instance';
import { expect } from 'chai';
import sinon from 'sinon';

// if your issue is dialect specific, remove the dialects you don't need to test on.
export const testingOnDialects = new Set(['mssql', 'sqlite', 'mysql', 'mariadb', 'postgres', 'postgres-native']);

// You can delete this file if you don't want your SSCCE to be tested against Sequelize 6

// Your SSCCE goes inside this function.
export async function run() {
  // This function should be used instead of `new Sequelize()`.
  // It applies the config for your SSCCE to work on CI.
  const sequelize = createSequelize6Instance({
    logQueryParameters: true,
    benchmark: true,
    define: {
      // For less clutter in the SSCCE
      timestamps: false,
    },
  });

  class A extends Model {
  }

  A.init({}, {
    sequelize
  });
  class B extends Model { }

  B.init({}, {
    sequelize
  });
  //junction table with user defined unique constraint of [AId, BId, additionalField]
  class C extends Model {
  }
  C.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    AId: {
      type: DataTypes.INTEGER,
      references: {
        model: A
      },
      unique: 'unique_index'
    },
    BId: {
      type: DataTypes.INTEGER,
      references: {
        model: B,
      },
      unique: 'unique_index'
    },
    flag: {
      type: DataTypes.BOOLEAN,
      unique: 'unique_index'
    }
  }, {
    sequelize
  });


  //turn off default unique constraint
  A.belongsToMany(B, { through: { model: C, unique: false }, foreignKey: { name: 'AId' } });
  B.belongsToMany(A, { through: { model: C, unique: false }, foreignKey: { name: 'BId' } });


  await sequelize.sync({ force: true });

  const a = await A.create();

  const b = await B.create();

  //@ts-ignore
  await a.addB(b, {
    through: {
      flag: false
    }
  });

  //@ts-ignore
  await a.addB(b, {
    through: {
      flag: true
    }
  });

  //@ts-ignore
  const bs = await a.getBs();
  expect(bs.length).to.equal(2);
}
