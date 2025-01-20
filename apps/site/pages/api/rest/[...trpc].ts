import { restApiHandler, createTrpcContext } from "@self-learning/api";

// This handler will process all REST API requests under /api/rest/*
export default restApiHandler(createTrpcContext);
