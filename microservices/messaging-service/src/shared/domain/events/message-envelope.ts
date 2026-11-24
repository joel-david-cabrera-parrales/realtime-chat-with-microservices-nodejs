export interface MessageEnvelope<TData = unknown> {
  specversion: "1.0";
  id: string;
  type: string;
  source: string;
  subject: string;
  time: string;
  datacontenttype: "application/json";
  data: TData;
}