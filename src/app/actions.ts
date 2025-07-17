'use server';

import { assessCommunicationQuality, type AssessCommunicationQualityInput, type AssessCommunicationQualityOutput } from '@/ai/flows/assess-communication-quality';
import { toast } from '@/hooks/use-toast';

export async function getCommunicationQuality(
  metrics: Omit<AssessCommunicationQualityInput, 'otherMetrics'>
): Promise<AssessCommunicationQualityOutput> {
  try {
    const assessment = await assessCommunicationQuality({
      ...metrics,
      otherMetrics: JSON.stringify({ timestamp: new Date().toISOString() }),
    });
    return assessment;
  } catch (error) {
    console.error('AI assessment failed:', error);
    return {
      rating: 'Error',
      justification: 'The AI assessment service failed to process the request. Please try again later.',
    };
  }
}
