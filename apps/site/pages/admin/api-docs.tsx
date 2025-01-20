import { useEffect, useState } from "react";
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import { AdminGuard } from "@self-learning/ui/layouts";

/**
 * Retrieves the OpenAPI spec from the server and renders SwaggerUI for testing.
 * Only Admins can access this page.
 * @returns
 */
export default function ApiDocs() {
	const [spec, setSpec] = useState(null);

	useEffect(() => {
		fetch("/api/openapi")
			.then(res => res.json())
			.then(setSpec);
	}, []);

	return (
		<AdminGuard>
			{spec && <SwaggerUI spec={spec} />}
			{!spec && <div>Loading...</div>}
		</AdminGuard>
	);
}
