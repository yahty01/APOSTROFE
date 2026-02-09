'use client';

import {useFormStatus} from 'react-dom';

import {useReportPending} from '@/lib/pending';

export function PendingFormStatusReporter() {
  const {pending} = useFormStatus();
  useReportPending(pending);
  return null;
}
