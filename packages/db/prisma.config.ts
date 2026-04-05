import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: "postgres://c0d607e6d5bbe248e3d1a3bd8e077d33de1d5ea5def9bb327233fe8003c7e4ee:sk_d67gwor9Rlqeep-G3jzY9@db.prisma.io:5432/postgres?sslmode=require",
  },
});