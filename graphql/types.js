const { GraphQLObjectType, GraphQLString } = require("graphql");

const TxType = new GraphQLObjectType({
    name: "Trnsaction",
    type: "Query",
    fields: {
        token_address: { type: GraphQLString },
        from_address: { type: GraphQLString },
        to_address: { type: GraphQLString },
        value: { type: GraphQLString },
        transaction_hash: { type: GraphQLString },
        log_index: { type: GraphQLString },
        block_timestamp: { type: GraphQLString },
        block_number: { type: GraphQLString },
        block_hash: { type: GraphQLString }
    }
});

module.exports = { TxType };
