import { llmClient } from './llm-client';

export interface CvAnalysisResult {
  skills: string[];
  experience_years: number;
  education: string[];
  strengths: string[];
  weaknesses: string[];
  overall_fit_score: number;
}

export async function analyzeCv(cvText: string): Promise<CvAnalysisResult> {
  const prompt = `Analyze the following CV and extract the following information in JSON format:
- skills: array of technical and professional skills
- experience_years: total years of professional experience (number)
- education: array of education qualifications
- strengths: array of key strengths based on the CV
- weaknesses: array of potential areas for improvement or gaps
- overall_fit_score: a score from 0-100 indicating overall candidate quality

CV Content:
${cvText}

Return only valid JSON with these exact fields.`;

  const response = await llmClient.chat(
    [
      {
        role: 'system',
        content: 'You are an expert HR analyst. Analyze CVs and return structured JSON data.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    {
      jsonMode: true,
      temperature: 0.3,
    }
  );

  const analysis = JSON.parse(response.content) as CvAnalysisResult;
  return analysis;
}

