import { AnalysisPanelsContainer } from "./panels/AnalysisPanelsContainer";

interface AnalysisResultsProps {
  result: any;
}

export function AnalysisResults({ result }: AnalysisResultsProps) {
  return <AnalysisPanelsContainer result={result} />;
}
