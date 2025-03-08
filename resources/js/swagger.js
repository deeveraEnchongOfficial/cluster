// import SwaggerUI from "swagger-ui-dist/swagger-ui-es-bundle.js";
import SwaggerUI from "swagger-ui-dist/swagger-ui-bundle.js";
import "swagger-ui-dist/swagger-ui.css";

SwaggerUI({
  dom_id: "#swagger-api",
  url: "/api.yaml",
});
