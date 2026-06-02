// Service singletons live in @/services/instances so Server Components can import
// them without coupling page code to the api/v1 route folder. Re-exported here so
// existing route handlers that import from '../_services' keep working unchanged.
export * from '@/services/instances';
