import SwaggerUI from "swagger-ui-dist/swagger-ui-bundle";
import "swagger-ui-dist/swagger-ui.css";

SwaggerUI({
    dom_id: "#swagger-api",
    url: "/api.yaml",
});
