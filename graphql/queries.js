const { client } = require("../conn/pg");
const { GraphQLObjectType, GraphQLString } = require("graphql");
const { TxType } = require("./types");

const tableName = "assignm_t_1";

const RootQuery = new GraphQLObjectType({
    name: "RootQueryType",
    type: "Query",
    fields: {
        transaction: {
            type: TxType,
            args: { token_address: { type: GraphQLString } },
            resolve(parentValue, args) {
                const query = `SELECT * FROM ${tableName} WHERE token_address=$1`;
                const values = [args.token_address];

                return client
                    .query(query, values)
                    .then(res => res)
                    .catch(err => err);
            }
        }
    }
});

exports.query = RootQuery;
