import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Building2, CalendarDays, MapPin, Plus, Video } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/console/PageHeader";
import { StatCard } from "@/components/console/StatCard";
import { StatusBadge } from "@/components/console/StatusBadge";
import { AppointmentSheet } from "@/components/console/AppointmentSheet";
import { AppointmentDialog } from "@/components/console/AppointmentDialog";
import { GrievanceSheet } from "@/components/console/GrievanceSheet";
import { clock, prettyDate, shortDate, todayISO } from "@/lib/format";

function nowClock() {
  return new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour12: false,
  }).slice(0, 5);
}

function ModeTag({ mode }) {
  const onsite = mode === "onsite";
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
      {onsite ? <MapPin className="h-2.5 w-2.5" /> : <Video className="h-2.5 w-2.5" />}
      {onsite ? "On-site" : "Online"}
    </span>
  );
}

export function DashboardPage() {
  const [selected, setSelected] = useState(null);
  const [creating, setCreating] = useState(false);
  const [openGrievance, setOpenGrievance] = useState(null);
  const today = todayISO();

  const { data: sessions, isLoading } = useQuery({
    queryKey: ["appointments", today],
    queryFn: async () => {
      const res = await base44.entities.Appointment.filter({ date: today }, { limit: 200 });
      return res?.items ?? res ?? [];
    },
  });

  const { data: clients } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await base44.entities.Client.list("-created_date", 300);
      return res?.items ?? res ?? [];
    },
  });

  const { data: grievances } = useQuery({
    queryKey: ["grievances"],
    queryFn: async () => {
      const res = await base44.entities.Grievance.list("-created_date", 200);
      return res?.items ?? res ?? [];
    },
  });

  const daySessions = (sessions || []).slice().sort((a, b) => a.start_time.localeCompare(b.start_time));
  const live = daySessions.filter((item) => item.status !== "cancelled");
  const next = live.find((item) => item.start_time >= nowClock() && item.status !== "completed");
  const onsiteToday = live.filter((item) => item.mode === "onsite").length;

  const clientRows = clients || [];
  const activeClients = clientRows.filter((client) => client.status === "active").length;
  const onboarding = clientRows.filter((client) => client.status === "onboarding").length;

  const openTickets = (grievances || []).filter((item) => item.status !== "resolved");
  const urgent = openTickets.filter((item) => item.priority === "urgent" || item.priority === "high");

  return (
    <>
      <PageHeader
        eyebrow={prettyDate(today)}
        title="Today at Pikonik"
        subtitle={`${live.length} sessions scheduled${next ? ` · next at ${clock(next.start_time)}` : ""}`}
      >
        <Button className="h-10 rounded-full px-4" onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" />
          New session
        </Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <StatCard
          label="Active clients"
          value={activeClients}
          hint={`${onboarding} in onboarding`}
          icon={Building2}
        />
        <StatCard
          label="Open grievances"
          value={openTickets.length}
          hint={`${urgent.length} high priority`}
          icon={AlertTriangle}
        />
        <StatCard label="Sessions today" value={live.length} hint="not cancelled" icon={CalendarDays} />
        <StatCard label="On-site today" value={onsiteToday} hint="team visits" icon={MapPin} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl border border-border bg-card shadow-[0_4px_20px_-2px_rgba(28,25,23,0.04)]">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Today's sessions
            </h2>
            <Link to="/calendar" className="text-xs font-medium text-primary hover:underline">
              Open calendar
            </Link>
          </div>

          {isLoading ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">Loading the day…</p>
          ) : daySessions.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="font-display text-xl">Nothing booked yet.</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share the client portal or add a session yourself.
              </p>
              <Button variant="outline" className="mt-4 h-10 rounded-full" onClick={() => setCreating(true)}>
                Add a session
              </Button>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {daySessions.map((appt) => (
                <li key={appt.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(appt)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                  >
                    <span className="w-14 shrink-0 font-mono text-[13px] tabular-nums text-muted-foreground">
                      {appt.start_time}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{appt.service_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {appt.business_name || appt.customer_name} · {appt.staff_name}
                      </span>
                    </span>
                    <span className="hidden shrink-0 sm:block">
                      <ModeTag mode={appt.mode} />
                    </span>
                    <StatusBadge status={appt.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="space-y-4">
          <section className="rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Open grievances
              </h2>
              <Link to="/grievances" className="text-xs font-medium text-primary hover:underline">
                View all
              </Link>
            </div>
            {openTickets.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground">
                No complaints waiting. Clients can raise one from the support page.
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {openTickets.slice(0, 4).map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setOpenGrievance(item)}
                      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/50"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{item.subject}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {item.business_name} · {item.category}
                        </span>
                      </span>
                      <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                        {shortDate((item.created_date || "").slice(0, 10))}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="rounded-xl border border-border bg-secondary p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Next up
            </p>
            {next ? (
              <div className="mt-2">
                <p className="font-display text-2xl leading-tight">{next.service_name}</p>
                <p className="mt-1 text-sm text-foreground/80">
                  {clock(next.start_time)} · {next.business_name || next.customer_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {next.mode === "onsite" ? "On-site visit" : "Online call"} with {next.staff_name}
                </p>
                <Button
                  variant="outline"
                  className="mt-4 h-10 w-full rounded-full bg-card"
                  onClick={() => setSelected(next)}
                >
                  View session
                </Button>
              </div>
            ) : (
              <div className="mt-2">
                <p className="font-display text-2xl leading-tight">All clear</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  No more sessions scheduled for today.
                </p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-border bg-card p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Client portal
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Clients book onboarding calls or ask for an on-site visit themselves.
            </p>
            <Button asChild variant="outline" className="mt-4 h-10 w-full rounded-full">
              <Link to="/book">Preview booking page</Link>
            </Button>
          </section>
        </div>
      </div>

      <AppointmentSheet
        appointment={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => !open && setSelected(null)}
      />
      <GrievanceSheet
        grievance={openGrievance}
        open={Boolean(openGrievance)}
        onOpenChange={(open) => !open && setOpenGrievance(null)}
      />
      <AppointmentDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}