import { Navigate, useParams } from 'react-router-dom';

export function LegacyQuestionnaireRedirect() {
  const { id } = useParams();
  return <Navigate to={`/health/prom-history/${id}`} replace />;
}
