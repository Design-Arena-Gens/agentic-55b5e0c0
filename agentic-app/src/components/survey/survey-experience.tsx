"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  categoryDetails,
  surveyBlueprint,
  type SurveyCategory,
  type SurveyOption,
} from "@/data/survey";
import {
  ArrowRight,
  BarChart3,
  Check,
  Compass,
  Flame,
  Loader2,
  RefreshCcw,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

type State = {
  activeStep: number;
  answers: Record<string, string>;
  isSubmitting: boolean;
  showResults: boolean;
};

const initialState: State = {
  activeStep: 0,
  answers: {},
  isSubmitting: false,
  showResults: false,
};

const easeOut = [0.16, 1, 0.3, 1] as const;

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: easeOut },
};

export function SurveyExperience() {
  const [state, setState] = useState<State>(initialState);

  const totalSteps = surveyBlueprint.questions.length;
  const progress = Math.round(
    (state.activeStep / (state.showResults ? totalSteps : totalSteps - 1)) * 100,
  );

  const currentQuestion = surveyBlueprint.questions[state.activeStep];

  const result = useMemo(() => {
    const scoreEntries: Array<[SurveyCategory, number]> = Object.keys(
      categoryDetails,
    ).map((key) => [key as SurveyCategory, 0]);

    Object.entries(state.answers).forEach(([questionId, optionId]) => {
      const question = surveyBlueprint.questions.find((q) => q.id === questionId);
      const option = question?.options.find((opt) => opt.id === optionId);
      if (!option) return;

      scoreEntries.forEach(([category], index) => {
        const additional = option.categoryWeights[category] ?? 0;
        scoreEntries[index] = [category, scoreEntries[index][1] + additional];
      });
    });

    const sorted = scoreEntries
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);

    const topCategory =
      sorted.length > 0 ? sorted[0][0] : (scoreEntries[0][0] as SurveyCategory);

    const totalRawScore = sorted.reduce((acc, [, score]) => acc + score, 0) || 1;

    return {
      topCategory,
      sortedScores: scoreEntries.map(([category, score]) => ({
        category,
        score,
        percentage: Math.round((score / totalRawScore) * 100),
      })),
    };
  }, [state.answers]);

  const handleOptionSelect = (option: SurveyOption) => {
    if (!currentQuestion) return;
    setState((prev) => ({
      ...prev,
      answers: {
        ...prev.answers,
        [currentQuestion.id]: option.id,
      },
    }));
  };

  const goToNext = async () => {
    if (!currentQuestion) return;
    if (!state.answers[currentQuestion.id]) return;

    if (state.activeStep === totalSteps - 1) {
      setState((prev) => ({ ...prev, isSubmitting: true }));
      // simulate async call for polish
      await new Promise((resolve) => setTimeout(resolve, 700));
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        showResults: true,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      activeStep: Math.min(prev.activeStep + 1, totalSteps - 1),
    }));
  };

  const goToPrevious = () => {
    setState((prev) => ({
      ...prev,
      activeStep: Math.max(prev.activeStep - 1, 0),
    }));
  };

  const reset = () => {
    setState(initialState);
  };

  const displayProgress = state.showResults ? 100 : Math.min(progress, 99);

  return (
    <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 pb-24 pt-20 sm:px-8 lg:px-12">
      <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-72 max-w-2xl rounded-full bg-gradient-to-br from-sky-200/60 via-indigo-100/40 to-purple-200/50 blur-3xl" />

      <header className="flex flex-col gap-6">
        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200/70 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm backdrop-blur">
          <Flame size={14} />
          Pulse check
        </div>
        <div className="space-y-4">
          <motion.h1
            className="text-balance text-4xl font-semibold text-slate-900 sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut }}
          >
            {surveyBlueprint.title}
          </motion.h1>
          <p className="max-w-2xl text-balance text-lg text-slate-600 sm:text-xl">
            {surveyBlueprint.tagline}
          </p>
          <div className="max-w-3xl rounded-3xl border border-slate-200/60 bg-white/80 p-6 text-base text-slate-500 shadow-sm backdrop-blur">
            {surveyBlueprint.description}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
            <span>{state.showResults ? "Complete" : "Progress"}</span>
            <span>{displayProgress}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200/70">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500"
              animate={{ width: `${displayProgress}%` }}
              transition={{ duration: 0.5, ease: easeOut }}
            />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/90 shadow-xl shadow-slate-900/5 backdrop-blur">
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/80 via-white/30 to-transparent" />
        <div className="grid gap-10 p-6 md:p-12">
          <AnimatePresence mode="wait">
            {state.showResults ? (
              <motion.div key="results" {...fadeIn} className="space-y-10">
                <ResultsView
                  onRestart={reset}
                  topCategory={result.topCategory}
                  sortedScores={result.sortedScores}
                />
              </motion.div>
            ) : (
              currentQuestion && (
                <motion.div key={currentQuestion.id} {...fadeIn} className="space-y-8">
                  <QuestionHeader
                    index={state.activeStep}
                    total={totalSteps}
                    title={currentQuestion.title}
                    prompt={currentQuestion.prompt}
                    helper={currentQuestion.helper}
                  />
                  <div className="grid gap-4 md:grid-cols-2">
                    {currentQuestion.options.map((option) => {
                      const selected =
                        state.answers[currentQuestion.id] === option.id;
                      const disabled = Boolean(
                        state.isSubmitting && !selected,
                      );
                      return (
                        <OptionCard
                          key={option.id}
                          option={option}
                          selected={selected}
                          disabled={disabled}
                          onSelect={() => handleOptionSelect(option)}
                        />
                      );
                    })}
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200/60 pt-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Sparkles className="h-4 w-4 text-slate-400" />
                      <span>
                        {state.activeStep + 1} / {totalSteps}{" "}
                        {totalSteps === 1 ? "step" : "steps"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={goToPrevious}
                        disabled={state.activeStep === 0 || state.isSubmitting}
                        className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-medium text-slate-500 transition hover:border-slate-200 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300"
                      >
                        <RefreshCcw className="h-4 w-4 rotate-180" />
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={goToNext}
                        disabled={
                          state.isSubmitting ||
                          !state.answers[currentQuestion.id]
                        }
                        className="inline-flex items-center gap-3 rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        {state.activeStep === totalSteps - 1 ? (
                          state.isSubmitting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Crunching signal…
                            </>
                          ) : (
                            <>
                              Reveal my signal
                              <Sparkles className="h-4 w-4" />
                            </>
                          )
                        ) : (
                          <>
                            Next
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </div>
      </section>

      <aside className="grid gap-4 text-sm text-slate-500 sm:grid-cols-2">
        <StatCard
          icon={<BarChart3 className="h-5 w-5 text-slate-400" />}
          headline="Pattern-based scoring"
          body="Each choice contributes to a live signal model across five dimensions — career, craft, community, tooling, and inspiration."
        />
        <StatCard
          icon={<Compass className="h-5 w-5 text-slate-400" />}
          headline="Actionable output"
          body="You leave with a prioritized theme, the story to tell stakeholders, and three concrete moves to execute this week."
        />
      </aside>
    </div>
  );
}

type QuestionHeaderProps = {
  index: number;
  total: number;
  title: string;
  prompt: string;
  helper?: string;
};

function QuestionHeader({
  index,
  total,
  title,
  prompt,
  helper,
}: QuestionHeaderProps) {
  return (
    <div className="space-y-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-[0.25em] text-slate-500">
        Step {index + 1} of {total}
      </span>
      <h2 className="text-pretty text-2xl font-semibold text-slate-900 sm:text-3xl">
        {title}
      </h2>
      <p className="max-w-2xl text-pretty text-slate-600">{prompt}</p>
      {helper ? (
        <p className="text-sm font-medium text-slate-400">{helper}</p>
      ) : null}
    </div>
  );
}

type OptionCardProps = {
  option: SurveyOption;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
};

function OptionCard({ option, selected, disabled, onSelect }: OptionCardProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onSelect}
      className={clsx(
        "group relative flex h-full flex-col gap-3 rounded-3xl border px-5 py-6 text-left transition",
        "border-slate-200/70 bg-white/80 shadow-sm hover:border-slate-300 hover:shadow-md hover:shadow-slate-900/5",
        selected &&
          "border-slate-900 bg-slate-900 text-slate-100 shadow-lg shadow-slate-900/10 hover:border-slate-900 hover:bg-slate-900",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      {option.badge ? (
        <span
          className={clsx(
            "inline-flex items-center self-start rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]",
            selected
              ? "border-white/20 bg-white/10 text-slate-100"
              : "border-slate-200 bg-slate-50 text-slate-500",
          )}
        >
          {option.badge}
        </span>
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <p
            className={clsx(
              "text-lg font-semibold text-slate-900 transition-colors",
              selected && "text-white",
            )}
          >
            {option.label}
          </p>
          <p
            className={clsx(
              "text-sm text-slate-500 transition-colors",
              selected && "text-slate-200",
            )}
          >
            {option.description}
          </p>
        </div>
        <div
          className={clsx(
            "flex h-9 w-9 items-center justify-center rounded-full border text-slate-400 transition",
            selected
              ? "border-white/40 bg-white/10 text-white"
              : "border-slate-200 bg-slate-50 group-hover:border-slate-300 group-hover:text-slate-600",
          )}
        >
          {selected ? <Check className="h-5 w-5" /> : <ArrowRight className="h-4 w-4" />}
        </div>
      </div>
    </button>
  );
}

type ResultsViewProps = {
  topCategory: SurveyCategory;
  sortedScores: Array<{
    category: SurveyCategory;
    score: number;
    percentage: number;
  }>;
  onRestart: () => void;
};

function ResultsView({
  topCategory,
  sortedScores,
  onRestart,
}: ResultsViewProps) {
  const detail = categoryDetails[topCategory];

  return (
    <div className="space-y-10">
      <div className="overflow-hidden rounded-[2.5rem] border border-slate-200/70 bg-white/80">
        <div
          className={clsx(
            "relative border-b border-slate-200/70 bg-gradient-to-r px-8 py-10 text-white",
            detail.accent,
          )}
        >
          <div className="absolute -left-24 top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -right-12 bottom-10 h-40 w-40 rounded-full bg-white/20 blur-3xl" />
          <div className="relative flex flex-col gap-4">
            <span className="inline-flex items-center gap-2 self-start rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.3em]">
              <Sparkles size={16} />
              Your Signal
            </span>
            <h2 className="text-pretty text-3xl font-semibold sm:text-4xl">
              {detail.title}
            </h2>
            <p className="text-lg text-white/80 sm:text-xl">{detail.headline}</p>
            <p className="max-w-3xl text-sm text-white/70 sm:text-base">
              {detail.description}
            </p>
          </div>
        </div>

        <div className="grid gap-10 px-8 py-10 md:grid-cols-[2.2fr_1fr]">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
                Top moves to run now
              </h3>
              <ul className="grid gap-3 text-sm text-slate-600">
                {detail.moves.map((move) => (
                  <li
                    key={move}
                    className="group flex items-start gap-3 rounded-2xl border border-transparent bg-slate-50/70 px-4 py-3 leading-relaxed transition hover:border-slate-200 hover:bg-white"
                  >
                    <span className="mt-1 inline-flex h-2 w-2 translate-y-1 rounded-full bg-slate-900 group-hover:scale-110" />
                    <span>{move}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:text-slate-900"
            >
              <RefreshCcw className="h-4 w-4" />
              Restart survey
            </button>
          </div>

          <div className="space-y-5 rounded-3xl border border-slate-200/70 bg-slate-50/70 p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Signal breakdown
            </h3>
            <div className="space-y-4">
              {sortedScores.map(({ category, percentage, score }) => {
                const info = categoryDetails[category];
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between text-sm font-medium text-slate-500">
                      <span className="flex items-center gap-2">
                        <span
                          className={clsx(
                            "inline-flex h-2.5 w-2.5 rounded-full bg-gradient-to-r",
                            info.accent,
                          )}
                        />
                        {info.title}
                      </span>
                      <span className="text-xs tabular-nums text-slate-400">
                        {score.toFixed(1)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                      <div
                        className={clsx("h-full w-full bg-gradient-to-r", info.accent)}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: React.ReactNode;
  headline: string;
  body: string;
};

function StatCard({ icon, headline, body }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm backdrop-blur">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-600">{headline}</p>
      <p className="text-sm text-slate-500 leading-relaxed">{body}</p>
    </div>
  );
}
