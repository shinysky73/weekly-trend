import axios from 'axios';

export interface SendNewsletterParams {
  html: string;
  subject: string;
  recipients: string[];
  pipelineRunId?: number;
}

export interface NewsletterSendRecord {
  id: number;
  pipelineRunId: number | null;
  subject: string;
  recipientCount: number;
  status: string;
  errorLog: string | null;
  sentAt: string;
}

export async function sendNewsletter(params: SendNewsletterParams): Promise<NewsletterSendRecord> {
  const response = await axios.post<NewsletterSendRecord>('/newsletter/send', params);
  return response.data;
}

export async function fetchSendHistory(): Promise<NewsletterSendRecord[]> {
  const response = await axios.get<NewsletterSendRecord[]>('/newsletter/sends');
  return response.data;
}
