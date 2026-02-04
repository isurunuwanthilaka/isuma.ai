import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'You are an expert HR analyst. Analyze CVs and return structured JSON data.',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const content = response.choices[0].message.content;
  if (!content) {
    throw new Error('No response from OpenAI');
  }

  const analysis = JSON.parse(content) as CvAnalysisResult;
  return analysis;
}
