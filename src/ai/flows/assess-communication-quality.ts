// assess-communication-quality.ts
'use server';

/**
 * @fileOverview This file contains a Genkit flow for assessing communication quality based on quantum fidelity metrics.
 *
 * - assessCommunicationQuality - A function that assesses the communication quality and returns an understandable rating.
 * - AssessCommunicationQualityInput - The input type for the assessCommunicationQuality function.
 * - AssessCommunicationQualityOutput - The return type for the assessCommunicationQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssessCommunicationQualityInputSchema = z.object({
  fidelity: z.number().describe('The quantum fidelity metric (0 to 1, higher is better).'),
  qber: z.number().describe('The Quantum Bit Error Rate (QBER) (0 to 1, lower is better).'),
  otherMetrics: z.string().optional().describe('Other relevant metrics as a JSON string.'),
});

export type AssessCommunicationQualityInput = z.infer<typeof AssessCommunicationQualityInputSchema>;

const AssessCommunicationQualityOutputSchema = z.object({
  rating: z.string().describe('An understandable rating of the communication quality (e.g., Excellent, Good, Fair, Poor).'),
  justification: z.string().describe('A brief justification for the rating based on the input metrics.'),
});

export type AssessCommunicationQualityOutput = z.infer<typeof AssessCommunicationQualityOutputSchema>;

export async function assessCommunicationQuality(input: AssessCommunicationQualityInput): Promise<AssessCommunicationQualityOutput> {
  return assessCommunicationQualityFlow(input);
}

const assessCommunicationQualityPrompt = ai.definePrompt({
  name: 'assessCommunicationQualityPrompt',
  input: {
    schema: AssessCommunicationQualityInputSchema,
  },
  output: {
    schema: AssessCommunicationQualityOutputSchema,
  },
  prompt: `You are an AI expert in quantum communication systems. Assess the communication quality based on the following metrics and provide an understandable rating and justification.

Fidelity: {{{fidelity}}}
QBER: {{{qber}}}
Other Metrics: {{{otherMetrics}}}

Provide a rating from the following options: Excellent, Good, Fair, Poor.
Provide a brief justification for the rating.
`,
});

const assessCommunicationQualityFlow = ai.defineFlow(
  {
    name: 'assessCommunicationQualityFlow',
    inputSchema: AssessCommunicationQualityInputSchema,
    outputSchema: AssessCommunicationQualityOutputSchema,
  },
  async input => {
    const {output} = await assessCommunicationQualityPrompt(input);
    return output!;
  }
);
