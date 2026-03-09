import { Code2, CheckCircle2, Zap } from "lucide-react";

const milestones = [
  {
    icon: Code2,
    step: "Step 1",
    title: "Write your first program",
    description: "Understand how code actually works",
  },
  {
    icon: CheckCircle2,
    step: "Step 2",
    title: "Solve real problems",
    description: "Build logic, not just syntax",
  },
  {
    icon: Zap,
    step: "Step 3",
    title: "Ship something real",
    description: "Go from learner to builder",
  },
];

export function MilestoneStrip() {
  return (
    <section className="relative py-16">
      <div className="container mx-auto px-6">
        <div className="grid gap-4 sm:grid-cols-3">
          {milestones.map((milestone, i) => {
            const Icon = milestone.icon;
            return (
              <div
                key={milestone.step}
                className="flex items-center gap-4 rounded-xl border border-border bg-card/60 p-5"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-muted-foreground">{milestone.step}</p>
                  <p className="font-display text-base font-semibold">{milestone.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{milestone.description}</p>
                </div>
                {i < milestones.length - 1 && (
                  <div className="hidden h-px w-8 flex-shrink-0 bg-border sm:block" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
