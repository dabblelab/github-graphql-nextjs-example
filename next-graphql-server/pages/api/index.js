import { gql } from "apollo-server-micro";
import axios from "axios";

export const typeDefs = gql`
type Repository
{
  nameWithOwner: String
  description: String
  updatedAt: String
  createdAt: String
  diskUsage: Int
}
type Search
{
  
  repositoryCount: Int
  nodes: [Repository
    ]
}
type Data
{
  search: Search
}
type Query
{
  data: Data
}
`

export const resolvers = {
  Query: {
    data: async () => {
      try {
        const topics = await axios.get("https://api.github.com/graphql", {
          headers: {
            authorization: 'TOKEN_HERE'
          }
        })
        return topics.data.map(({ description, updatedAt, createdAt, diskUsage }) => ({
          description,
          updatedAt,
          createdAt,
          diskUsage
        }));
      } catch (error) {
        throw error;
      }
    },
  }
}