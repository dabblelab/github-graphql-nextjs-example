import { gql } from "apollo-server-micro";
import axios from "axios";

export const typeDefs = gql`
  type Repository {
    nameWithOwner: String
    description: String
    updatedAt: String
    createdAt: String
    diskUsage: Int
  }
  type Search {
    repositoryCount: Int
    nodes: [Repository]
  }

  type Query {
    search(topic: String!, first: Int!): Search
  }
`;

export const resolvers = {
  Query: {
    search: async (_, args) => {
      try {
        const { topic, first } = args;
        /* searchParams is mainly the query that is sent to the Github GQL API to get our desired data.
         As of now, only the TOPIC and the FIRST options of this query are taken as input from the user
         */
        const searchParams = `search(query: "topic:${topic} sort:updated-desc", type: REPOSITORY ,first:${first})`;
        const topics = await axios.post(
          "https://api.github.com/graphql",
          {
            // Stuck here on searchType
            query: `{
              ${searchParams} {
                repositoryCount
                nodes {
                  ... on Repository {
                    nameWithOwner
                    description
                    updatedAt
                    createdAt
                    diskUsage
                  }
                }
              }
            }`,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.GIT_TOKEN}`,
            },
          }
        );
        console.log(topics.data);
        if (topics.data.errors) throw new Error(topics.data.errors[0].message);
        const nodes = topics.data.data.search.nodes.map(
          ({ nameWithOwner, description, updatedAt, createdAt, diskUsage }) => ({
            nameWithOwner,
            description,
            updatedAt,
            createdAt,
            diskUsage,
          })
        );
        const repositoryCount = topics.data.data.search.repositoryCount;
        return { repositoryCount, nodes };
      } catch (error) {
        throw error;
      }
    },
  },
};
