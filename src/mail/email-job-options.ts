import { JobsOptions } from 'bullmq';


export const EMAIL_JOB_OPTIONS: JobsOptions = {
  attempts: 5, 
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 1000, age: 3600 }, 
  removeOnFail: false, 
};
