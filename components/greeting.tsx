import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import { FifthSeasonMark } from './fifthseason/brand';
import { Iris } from './fifthseason/logo-openings';

const INTRO_SEEN = 'fs-intro-seen';

export const Greeting = () => {
  // The full Iris opening plays once, on a person's first empty chat; after
  // that the mark simply sits there. Decided after mount so the server render
  // and the first client render agree.
  const [firstVisit, setFirstVisit] = useState<boolean | null>(null);
  // Pinned once per mount: React re-runs effects in development, and the
  // second run would otherwise read the flag the first run just wrote.
  const decided = useRef<boolean | null>(null);

  useEffect(() => {
    if (decided.current !== null) {
      setFirstVisit(decided.current);
      return;
    }
    let seen = false;
    try {
      seen = localStorage.getItem(INTRO_SEEN) === '1';
      localStorage.setItem(INTRO_SEEN, '1');
    } catch {
      // Storage blocked: treat every visit as a return visit.
      seen = true;
    }
    decided.current = !seen;
    setFirstVisit(!seen);
  }, []);

  return (
    <div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20 px-8 size-full flex flex-col justify-center"
    >
      <div className="mb-6 h-14" data-testid="greeting-mark">
        {firstVisit === true && (
          <div className="w-44">
            <Iris />
          </div>
        )}
        {firstVisit === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <FifthSeasonMark size={40} title={null} />
          </motion.div>
        )}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: firstVisit ? 1.4 : 0.5 }}
        className="text-2xl font-semibold"
      >
        Hello there!
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: firstVisit ? 1.5 : 0.6 }}
        className="text-2xl text-zinc-500"
      >
        How can I help you today?
      </motion.div>
    </div>
  );
};
