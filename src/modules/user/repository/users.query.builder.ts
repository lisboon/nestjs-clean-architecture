import PrismaQueryBuilder from "@/modules/@shared/repository/prisma-query-builder";

export default class UsersQueryBuilder extends PrismaQueryBuilder {
  subItems = {};
  whereFields = ["role", "active"];
  inFields = [];
  orFields = [];
  searchFields = ["name", "email"];
  sortableFields = ["name", "email", "role", "createdAt"];
  relationFields = [];
  relationFilter = [];
  include = {};
}
