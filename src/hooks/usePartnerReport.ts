import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { MonthlyPartnerReport } from '@/lib/types';

// ── Helper: build date range from month/year ─────────────────

function buildDateRange(month: number, year: number) {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return {
    from: start.toISOString(),
    to: end.toISOString(),
  };
}

// ── Query: Monthly partner report (single month) ─────────────

interface UsePartnerReportOptions {
  partnerId: string | undefined;
  month: number;
  year: number;
}

export function usePartnerReport({ partnerId, month, year }: UsePartnerReportOptions) {
  return useQuery<MonthlyPartnerReport[]>({
    queryKey: ['partner-report', partnerId, month, year],
    queryFn: async () => {
      const { from, to } = buildDateRange(month, year);

      const { data, error } = await supabase
        .from('monthly_partner_report')
        .select('*')
        .eq('partner_id', partnerId!)
        .gte('completed_at', from)
        .lte('completed_at', to)
        .order('completed_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as MonthlyPartnerReport[];
    },
    enabled: !!partnerId,
  });
}

// ── Fetch: Report range for Excel download ───────────────────

export async function fetchReportRange(
  partnerId: string,
  startMonth: number,
  startYear: number,
  endMonth: number,
  endYear: number,
): Promise<MonthlyPartnerReport[]> {
  const { from } = buildDateRange(startMonth, startYear);
  const { to } = buildDateRange(endMonth, endYear);

  const { data, error } = await supabase
    .from('monthly_partner_report')
    .select('*')
    .eq('partner_id', partnerId)
    .gte('completed_at', from)
    .lte('completed_at', to)
    .order('completed_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as MonthlyPartnerReport[];
}
