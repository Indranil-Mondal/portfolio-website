import { useEffect, useRef, useState, type ReactNode } from 'react';
import { animate, motion, useInView, useReducedMotion, type Variants } from 'framer-motion';
import {
  BrainCircuit,
  Cable,
  Check,
  Cpu,
  FileText,
  Layers,
  Network,
  Plug,
  Puzzle,
  Server,
  type LucideIcon,
} from 'lucide-react';
import { SECTION_IDS, ai_engineering, type McpServer } from '../lib/data';
import { EASE_OUT, fadeUp } from '../lib/motion';
import SectionHeader from './ui/SectionHeader';
import StatusBadge from './ui/StatusBadge';

// AI Lab: everything under ai_engineering in the JSON, as a bento grid of Prisma cards.
// Tile labels, "tools", "runs" and the flow-diagram node names are UI copy; every fact is data.

const SECTION_ID = SECTION_IDS.aiLab;
const HEADING_ID = `${SECTION_ID}-heading`;
const tileId = (name: string) => `${SECTION_ID}-${name}`;

const EYEBROW = 'text-primary text-[10px] sm:text-xs uppercase tracking-[0.2em]';
const LABEL = 'text-[10px] sm:text-xs uppercase tracking-[0.2em] text-gray-400';
const CHIP =
  'inline-flex max-w-full items-center rounded-full border border-[#2a2a2a] px-2.5 py-1 text-[10px] sm:text-xs leading-snug text-gray-400 [overflow-wrap:anywhere]';

const pad = (n: number) => String(n).padStart(2, '0');
const plural = (count: number, one: string, many: string) => (count === 1 ? one : many);

/** A leading figure such as "86.1%", "1,640" or "0 of 20", as in the case study. */
const LEADING_FIGURE = /^(~?\d[\d.,]*%?(?:\s+of\s+\d[\d.,]*%?)?)(?=[\s,;:]|$)/;

function splitLeadingFigure(sentence: string): { figure: string | null; rest: string } {
  const text = sentence.trim();
  const match = LEADING_FIGURE.exec(text);
  if (!match) return { figure: null, rest: text };
  const figure = match[1].replace(/[.,]+$/, '');
  const rest = text.slice(figure.length).replace(/^[\s,;:]+/, '');
  return { figure, rest };
}

/* ------------------------------------------------------------------ */
/* Building blocks                                                     */
/* ------------------------------------------------------------------ */

interface TileProps {
  /** id of the tile's <h3>. */
  id: string;
  icon: LucideIcon;
  label: ReactNode;
  /** Shown at the right of the tile header (e.g. a StatusBadge). */
  aside?: ReactNode;
  /** Grid placement classes. */
  className?: string;
  delay?: number;
  children: ReactNode;
}

function Tile({ id, icon: Icon, label, aside, className = '', delay = 0, children }: TileProps) {
  return (
    <motion.article
      aria-labelledby={id}
      {...fadeUp({ delay, y: 30, margin: '-80px 0px -80px 0px' })}
      className={`relative flex min-w-0 flex-col rounded-2xl border border-[#1a1a1a] bg-[#0e0e0e] p-5 transition-colors duration-300 hover:border-[#2a2a2a] sm:p-6 md:p-7 ${className}`}
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
        <h3 id={id} className={`flex items-center gap-2.5 ${EYEBROW}`}>
          <span
            aria-hidden="true"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#141414]"
          >
            <Icon className="h-4 w-4 text-primary" strokeWidth={1.75} />
          </span>
          <span>{label}</span>
        </h3>
        {aside}
      </div>
      {children}
    </motion.article>
  );
}

function ChipList({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap gap-1.5 sm:gap-2">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className={CHIP}>
          {item}
        </li>
      ))}
    </ul>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="flex items-start gap-2.5">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} />
          <span className="min-w-0 text-xs leading-relaxed text-gray-400 sm:text-sm">{item}</span>
        </li>
      ))}
    </ul>
  );
}

/** Counts up from 0 once in view; shows the final value at once under reduced motion. */
function CountUp({ value, className = '' }: { value: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px 0px -80px 0px' });
  const reduceMotion = useReducedMotion();
  const [display, setDisplay] = useState(reduceMotion ? value : 0);

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(value);
      return undefined;
    }
    if (!inView) return undefined;
    const controls = animate(0, value, {
      duration: 1.6,
      ease: EASE_OUT,
      onUpdate: (latest) => setDisplay(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduceMotion, value]);

  return (
    <span ref={ref} className={className}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{value}</span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* MCP server                                                          */
/* ------------------------------------------------------------------ */

// One observer on the list staggers the lines, so every line shows even after a fast scroll.
const terminalListVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};

const terminalLineVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT } },
};

function ToolTerminal({ name, tools }: { name: string; tools: string[] }) {
  return (
    <div className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#050505]">
      <div aria-hidden="true" className="flex items-center gap-1.5 border-b border-[#1a1a1a] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-primary/40" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/25" />
        <span className="h-2.5 w-2.5 rounded-full bg-primary/15" />
        <span className="ml-3 font-mono text-[11px] text-gray-400">tools/list</span>
      </div>
      <motion.ul
        aria-label={`Tools exposed by ${name}`}
        variants={terminalListVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-40px 0px -40px 0px' }}
        className="space-y-1.5 px-4 pb-2 pt-4"
      >
        {tools.map((tool, i) => (
          <motion.li
            key={`${i}-${tool}`}
            variants={terminalLineVariants}
            className="flex min-w-0 items-baseline gap-3"
          >
            <span aria-hidden="true" className="select-none font-mono text-[11px] tabular-nums text-primary/60">
              {pad(i + 1)}
            </span>
            <span className="min-w-0 font-mono text-xs text-[#E1E0CC]/90 [overflow-wrap:anywhere] sm:text-[13px]">
              {tool}
            </span>
          </motion.li>
        ))}
      </motion.ul>
      <div aria-hidden="true" className="flex items-center gap-2 px-4 pb-4 pt-1">
        <span className="font-mono text-[11px] text-primary/60">$</span>
        <span className="h-3.5 w-1.5 animate-pulse bg-primary/60" />
      </div>
    </div>
  );
}

function McpServerBlock({ server }: { server: McpServer }) {
  return (
    <div className="flex h-full min-w-0 flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <h4 className="break-words text-2xl font-normal leading-tight tracking-tight text-[#E1E0CC] sm:text-3xl md:text-4xl">
            {server.name}
          </h4>
          <span className="font-mono text-xs text-gray-400">v{server.version}</span>
        </div>
        <StatusBadge status={server.status} />
      </div>
      <p className="mt-2 text-sm leading-relaxed text-gray-400">{server.packaging}</p>

      <div className="mt-6 grid flex-1 grid-cols-1 gap-6 sm:mt-8 sm:grid-cols-2 sm:gap-8">
        <div className="min-w-0 space-y-6">
          <p className="flex items-end gap-3">
            <span className="text-6xl leading-[0.85] tracking-tight text-[#E1E0CC] tabular-nums sm:text-7xl">
              {server.tools}
            </span>
            <span className={`pb-1 ${EYEBROW}`}>{plural(server.tools, 'tool', 'tools')}</span>
          </p>
          <ChipList items={server.stack} label={`${server.name} stack`} />
          <CheckList items={server.highlights} />
        </div>
        <ToolTerminal name={server.name} tools={server.tool_names} />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Project memory flow diagram                                         */
/* ------------------------------------------------------------------ */

const FLOW_STEPS = ['prompt', 'hook', 'symptom index', 'injected context'] as const;
const FLOW_VIEW_W = 320;
const FLOW_NODE_W = 176;
const FLOW_NODE_H = 44;
const FLOW_STEP_Y = 96;
const FLOW_VIEW_H = 4 + (FLOW_STEPS.length - 1) * FLOW_STEP_Y + FLOW_NODE_H;

const flowNodes = FLOW_STEPS.map((label, i) => {
  const x = i % 2 === 0 ? 2 : FLOW_VIEW_W - FLOW_NODE_W - 2;
  const y = 2 + i * FLOW_STEP_Y;
  return { label, x, y, cx: x + FLOW_NODE_W / 2, cy: y + FLOW_NODE_H / 2 };
});

const flowLinks = flowNodes.slice(1).map((to, i) => {
  const from = flowNodes[i];
  const startY = from.y + FLOW_NODE_H;
  const endY = to.y - 2;
  return {
    d: `M${from.cx} ${startY} C${from.cx} ${startY + 30} ${to.cx} ${endY - 30} ${to.cx} ${endY}`,
    arrow: `M${to.cx - 5} ${endY - 7} L${to.cx} ${endY} L${to.cx + 5} ${endY - 7}`,
  };
});

const STEP_DELAY = 0.6;

const nodeVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.4, delay: i * STEP_DELAY, ease: EASE_OUT },
  }),
};

const linkVariants: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.45, delay: 0.2 + i * STEP_DELAY, ease: 'easeInOut' },
      opacity: { duration: 0.1, delay: 0.2 + i * STEP_DELAY },
    },
  }),
};

const arrowVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { duration: 0.2, delay: 0.6 + i * STEP_DELAY },
  }),
};

/** prompt, hook, symptom index, injected context. Drawn once in view; static under reduced motion. */
function MemoryFlow() {
  const reduceMotion = useReducedMotion();
  const play = reduceMotion
    ? { initial: 'visible' as const }
    : {
        initial: 'hidden' as const,
        whileInView: 'visible' as const,
        viewport: { once: true, margin: '-60px 0px -60px 0px' },
      };
  const last = flowNodes.length - 1;

  return (
    <motion.svg
      {...play}
      viewBox={`0 0 ${FLOW_VIEW_W} ${FLOW_VIEW_H}`}
      aria-hidden="true"
      focusable="false"
      className="h-auto w-full max-w-[320px]"
    >
      {flowLinks.map((link, i) => (
        <g key={link.d}>
          <motion.path
            d={link.d}
            custom={i}
            variants={linkVariants}
            fill="none"
            stroke="rgba(222, 219, 200, 0.5)"
            strokeWidth={1.5}
            strokeLinecap="round"
          />
          <motion.path
            d={link.arrow}
            custom={i}
            variants={arrowVariants}
            fill="none"
            stroke="rgba(222, 219, 200, 0.7)"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}
      {flowNodes.map((node, i) => (
        <motion.g key={node.label} custom={i} variants={nodeVariants}>
          <rect
            x={node.x}
            y={node.y}
            width={FLOW_NODE_W}
            height={FLOW_NODE_H}
            rx={12}
            fill={i === last ? 'rgba(222, 219, 200, 0.08)' : '#0a0a0a'}
            stroke={i === last ? 'rgba(222, 219, 200, 0.6)' : 'rgba(222, 219, 200, 0.28)'}
            strokeWidth={1}
          />
          <circle cx={node.x + 16} cy={node.cy} r={3} fill="rgba(222, 219, 200, 0.6)" />
          <text
            x={node.cx + 6}
            y={node.cy}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#E1E0CC"
            fontSize={13}
            className="font-mono"
          >
            {node.label}
          </text>
        </motion.g>
      ))}
    </motion.svg>
  );
}

/* ------------------------------------------------------------------ */
/* Section                                                             */
/* ------------------------------------------------------------------ */

const GRID_BACKGROUND = {
  backgroundImage:
    'linear-gradient(to right, rgba(222, 219, 200, 0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(222, 219, 200, 0.035) 1px, transparent 1px)',
  backgroundSize: '64px 64px',
  maskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, #000 25%, transparent 80%)',
  WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 35%, #000 25%, transparent 80%)',
} as const;

export default function AILab() {
  const {
    positioning,
    principles,
    mcp_servers_built: servers,
    claude_code_plugins: plugins,
    mcp_integrations: integrations,
    agent_skills: agentSkills,
    hooks_and_project_memory: memory,
    multi_agent_workflows: multiAgent,
    local_llm: localLlm,
  } = ai_engineering;
  // datasets is optional in the data model: render it only when present.
  const datasets: string[] = (localLlm as { datasets?: string[] }).datasets ?? [];
  const principlesHeadingId = tileId('principles-heading');

  return (
    <section
      id={SECTION_ID}
      aria-labelledby={HEADING_ID}
      className="relative overflow-hidden bg-black py-20 sm:py-28 md:py-36 px-4 md:px-6"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={GRID_BACKGROUND} />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[28%] h-[520px] w-[860px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-[120px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <SectionHeader
          id={HEADING_ID}
          eyebrow="AI Lab"
          title="Not just using AI."
          accent="Engineering with it."
          description={positioning}
        />

        {/* Principles */}
        {principles.length > 0 ? (
          <div className="mb-12 sm:mb-16 md:mb-20">
            <motion.h3 id={principlesHeadingId} {...fadeUp({ y: 10 })} className={`mb-6 sm:mb-8 ${EYEBROW}`}>
              Principles
            </motion.h3>
            <ol
              aria-labelledby={principlesHeadingId}
              className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4"
            >
              {principles.map((principle, i) => (
                <motion.li
                  key={`${i}-${principle}`}
                  {...fadeUp({ delay: i * 0.08 })}
                  className="border-t border-[#2a2a2a] pt-5"
                >
                  <span aria-hidden="true" className="font-mono text-xs text-primary tabular-nums">
                    {pad(i + 1)}
                  </span>
                  <p className="mt-4 font-serif italic text-xl leading-snug text-[#E1E0CC] lg:text-[1.375rem]">
                    {principle}
                  </p>
                </motion.li>
              ))}
            </ol>
          </div>
        ) : null}

        {/* Bento grid: 1 column, 6 on md, 12 on lg */}
        <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-6 lg:grid-cols-12">
          {/* (1) MCP servers built: large, spans two rows on lg */}
          {servers.length > 0 ? (
            <Tile
              id={tileId('mcp-servers')}
              icon={Server}
              label={plural(servers.length, 'MCP server I built', 'MCP servers I built')}
              className="md:col-span-6 lg:col-span-7 lg:row-span-2"
            >
              <div className="flex flex-1 flex-col gap-10 divide-y divide-[#1a1a1a]">
                {servers.map((server, i) => (
                  <div key={`${i}-${server.name}`} className={`flex-1 ${i > 0 ? 'pt-10' : ''}`}>
                    <McpServerBlock server={server} />
                  </div>
                ))}
              </div>
            </Tile>
          ) : null}

          {/* (3) Claude Code plugins */}
          {plugins.length > 0 ? (
            <Tile
              id={tileId('plugins')}
              icon={Puzzle}
              label={plural(plugins.length, 'Claude Code plugin', 'Claude Code plugins')}
              className="md:col-span-3 lg:col-span-5"
              delay={0.1}
            >
              <div className="space-y-8 divide-y divide-[#1a1a1a]">
                {plugins.map((plugin, i) => (
                  <div key={`${i}-${plugin.name}`} className={i > 0 ? 'pt-8' : ''}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
                        <h4 className="font-mono text-lg text-[#E1E0CC] [overflow-wrap:anywhere] sm:text-xl">
                          {plugin.name}
                        </h4>
                        <span className="font-mono text-xs text-gray-400">v{plugin.version}</span>
                      </div>
                      <StatusBadge status={plugin.status} />
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-gray-400">{plugin.purpose}</p>
                    <ul className="mt-5 space-y-2.5">
                      {plugin.components.map((component, j) => (
                        <li key={`${j}-${component}`} className="flex items-start gap-2.5">
                          <span aria-hidden="true" className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary/70" />
                          <span className="min-w-0 text-xs leading-relaxed text-[#E1E0CC]/85 sm:text-sm">
                            {component}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Tile>
          ) : null}

          {/* (5) MCP integrations */}
          {integrations.length > 0 ? (
            <Tile
              id={tileId('mcp-integrations')}
              icon={Cable}
              label={plural(integrations.length, 'MCP integration', 'MCP integrations')}
              className="md:col-span-3 lg:col-span-5"
              delay={0.1}
            >
              <ul className="space-y-7">
                {integrations.map((integration, i) => (
                  <li key={`${i}-${integration.name}`} className="flex gap-4">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#101010]"
                    >
                      <Plug className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-base leading-tight text-[#E1E0CC] sm:text-lg">{integration.name}</h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{integration.use}</p>
                      <div className="mt-3 border-l border-primary/30 pl-3">
                        <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-primary/80">Evidence</p>
                        <p className="text-xs leading-relaxed text-gray-400 sm:text-sm">{integration.evidence}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </Tile>
          ) : null}

          {/* (4) Agent Skills */}
          {agentSkills.length > 0 ? (
            <Tile
              id={tileId('agent-skills')}
              icon={Layers}
              label={plural(agentSkills.length, 'Agent Skill', 'Agent Skills')}
              className="md:col-span-6 lg:col-span-7"
            >
              <ul className="divide-y divide-[#1a1a1a]">
                {agentSkills.map((skill, i) => (
                  <li key={`${i}-${skill.name}`} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1a1a1a] bg-[#101010]"
                    >
                      <FileText className="h-4 w-4 text-primary" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-mono text-sm text-[#E1E0CC] [overflow-wrap:anywhere] sm:text-base">
                        {skill.name}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{skill.purpose}</p>
                      <p className="mt-2.5 border-l border-primary/30 pl-3 text-xs leading-relaxed text-gray-400 sm:text-sm">
                        {skill.details}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Tile>
          ) : null}

          {/* (2) Hooks and project memory: large, spans two rows on lg */}
          <Tile
            id={tileId('project-memory')}
            icon={BrainCircuit}
            label="Project memory"
            className="md:col-span-6 lg:col-span-5 lg:row-span-2"
            delay={0.1}
          >
            <p className="text-sm leading-relaxed text-gray-400 sm:text-base">{memory.summary}</p>
            <figure className="my-8 flex flex-1 items-center justify-center sm:my-10">
              <MemoryFlow />
              <figcaption className="sr-only">
                Flow: {FLOW_STEPS.join(', then ')}.
              </figcaption>
            </figure>
            {memory.results.length > 0 ? (
              <ul className="grid grid-cols-1 gap-5 border-t border-[#1a1a1a] pt-6 sm:grid-cols-2">
                {memory.results.map((result, i) => {
                  const { figure, rest } = splitLeadingFigure(result);
                  return (
                    <li key={`${i}-${result}`} className="min-w-0">
                      {figure ? (
                        <p>
                          <span className="block text-4xl leading-none tracking-tight text-[#E1E0CC] tabular-nums sm:text-5xl">
                            {figure}
                          </span>{' '}
                          {rest ? (
                            <span className="mt-3 block text-xs leading-relaxed text-gray-400 sm:text-sm">{rest}</span>
                          ) : null}
                        </p>
                      ) : (
                        <p className="font-serif italic text-xl leading-snug text-[#E1E0CC] sm:text-2xl">{result}</p>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : null}
          </Tile>

          {/* (6) Multi-agent workflows */}
          <Tile
            id={tileId('multi-agent')}
            icon={Network}
            label="Multi-agent workflows"
            className="md:col-span-6 lg:col-span-7"
          >
            <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-10">
              <p className="flex items-end gap-3">
                <CountUp
                  value={multiAgent.runs}
                  className="text-6xl leading-[0.85] tracking-tight text-[#E1E0CC] tabular-nums sm:text-7xl md:text-8xl"
                />
                <span className={`pb-1.5 ${EYEBROW}`}>{plural(multiAgent.runs, 'run', 'runs')}</span>
              </p>
              {multiAgent.examples.length > 0 ? (
                <ol className="space-y-3">
                  {multiAgent.examples.map((example, i) => (
                    <li key={`${i}-${example}`} className="flex gap-3">
                      <span aria-hidden="true" className="mt-0.5 shrink-0 font-mono text-[11px] text-primary/70 tabular-nums">
                        {pad(i + 1)}
                      </span>
                      <span className="min-w-0 text-sm leading-relaxed text-[#E1E0CC]/85">{example}</span>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
            {multiAgent.patterns.length > 0 ? (
              <div className="mt-6 border-t border-[#1a1a1a] pt-6">
                <p id={tileId('patterns-label')} className={`mb-3 ${LABEL}`}>
                  Patterns
                </p>
                <ul aria-labelledby={tileId('patterns-label')} className="flex flex-wrap gap-1.5 sm:gap-2">
                  {multiAgent.patterns.map((pattern, i) => (
                    <li key={`${i}-${pattern}`} className={CHIP}>
                      <span aria-hidden="true" className="mr-2 h-1 w-1 shrink-0 rounded-full bg-primary/70" />
                      {pattern}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Tile>

          {/* (7) Local LLM: full width on lg */}
          <Tile
            id={tileId('local-llm')}
            icon={Cpu}
            label="Local LLM"
            aside={<StatusBadge status={localLlm.status} />}
            className="md:col-span-6 lg:col-span-12"
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
              <div className="min-w-0 lg:col-span-7">
                <p className={`mb-2 ${LABEL}`}>Model</p>
                <h4 className="font-mono text-xl leading-tight tracking-tight text-[#E1E0CC] [overflow-wrap:anywhere] sm:text-3xl md:text-4xl">
                  {localLlm.model}
                </h4>
                <p className="mt-5 text-sm leading-relaxed text-gray-400 sm:text-base">{localLlm.summary}</p>
              </div>
              <dl className="min-w-0 space-y-6 lg:col-span-5 lg:border-l lg:border-[#1a1a1a] lg:pl-12">
                <div>
                  <dt className={`mb-2 ${LABEL}`}>Hardware</dt>
                  <dd className="text-sm text-[#E1E0CC] sm:text-base">{localLlm.hardware}</dd>
                </div>
                {datasets.length > 0 ? (
                  <div>
                    <dt className={`mb-3 ${LABEL}`}>Datasets</dt>
                    <dd>
                      <ChipList items={datasets} />
                    </dd>
                  </div>
                ) : null}
                {localLlm.toolchain.length > 0 ? (
                  <div>
                    <dt className={`mb-3 ${LABEL}`}>Toolchain</dt>
                    <dd>
                      <ChipList items={localLlm.toolchain} />
                    </dd>
                  </div>
                ) : null}
              </dl>
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
