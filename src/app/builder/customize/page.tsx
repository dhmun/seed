import { Suspense } from 'react';
import CustomizeClient from './CustomizeClient';

export const dynamic = 'force-dynamic';

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CustomizeClient />
    </Suspense>
  );
}

