"use client";

import { useState } from "react";
import JobCustomerView from "@/components/job-customer-view";
import JobDetailsView from "@/components/job-details-view";

export default function JobManager({ job, shop }: { job: any, shop: any }) {
    const [view, setView] = useState<'details' | 'invoice'>('details');

    if (view === 'invoice') {
        return <JobDetailsView job={job} shop={shop} onBack={() => setView('details')} />;
    }

    return (
        <JobCustomerView
            job={job}
            shop={shop}
            onBack={() => window.history.back()}
            onInvoice={() => setView('invoice')}
        />
    );
}
