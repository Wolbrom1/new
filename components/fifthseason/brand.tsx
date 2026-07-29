'use client';

import { useId } from 'react';

/**
 * Fifth Season brand artwork, as vector.
 *
 * Every path here comes straight out of the official logo package: the five
 * shapes are the gradient icon's own subpaths — four circles and the centre
 * star — separated so each can be animated on its own, and the wordmark is
 * the outlined lettering from the horizontal lockup. Nothing is redrawn or
 * re-typed.
 *
 * The five gradients were sampled pixel by pixel off the master gradient
 * icon, because that file paints its gradient with an embedded raster rather
 * than SVG stops. Compared side by side against the original they match.
 */

export const MARK_VIEWBOX = '0 0 442.439 442.439';
export const LOCKUP_VIEWBOX = '0 0 670.039 206.594';

/** Icon content is (5,5)+432.44 square; the lockup mark is (0,0)+206.594. */
export const LOCKUP_MARK_SCALE = 0.47774;

/** Centre of the mark in icon coordinates. */
export const MARK_CENTRE = 221.2;

export const MARK = {
  star: 'M228.919,333.179c0,.207.014.411.016.617-2.552.172-5.119.292-7.715.292s-5.163-.119-7.715-.292c.002-.206.016-.41.016-.617,0-57.581-46.678-104.26-104.26-104.26-.207,0-.41.014-.617.016-.173-2.552-.292-5.119-.292-7.715s.119-5.162.292-7.714c.207.001.41.016.617.016,57.582,0,104.26-46.679,104.26-104.261,0-.207-.014-.41-.016-.617,2.552-.173,5.119-.292,7.715-.292s5.163.119,7.715.292c-.002.207-.016.41-.016.617,0,57.582,46.678,104.261,104.26,104.261.207,0,.411-.014.617-.016.173,2.552.292,5.119.292,7.714s-.119,5.163-.292,7.715c-.206-.001-.41-.016-.617-.016-57.582,0-104.26,46.679-104.26,104.26Z',
  tl: 'M213.505,108.644c-.334-57.296-46.871-103.644-104.245-103.644S5,51.679,5,109.26s46.347,103.912,103.644,104.245c3.796-56.181,48.68-101.065,104.861-104.862Z',
  tr: 'M333.796,213.506c57.296-.334,103.644-46.87,103.644-104.245S390.76,5,333.179,5s-103.911,46.347-104.245,103.644c56.181,3.796,101.065,48.681,104.861,104.862Z',
  bl: 'M108.644,228.934c-57.296.334-103.644,46.871-103.644,104.245s46.679,104.26,104.26,104.26,103.911-46.347,104.245-103.643c-56.181-3.796-101.065-48.681-104.861-104.862Z',
  br: 'M333.796,228.934c-3.796,56.181-48.68,101.065-104.861,104.862.334,57.296,46.871,103.643,104.245,103.643s104.26-46.679,104.26-104.26-46.347-103.911-103.644-104.245Z',
} as const;

export const WORDMARK = {
  fifth: [
    'M301.238,7.892v13.158h-42.827v26.187h35.345v12.771h-35.345v38.184h-14.835V7.892h57.662Z',
    'M326.648,14.083c0,4.902-3.74,8.385-8.514,8.385s-8.514-3.483-8.514-8.385c0-4.773,3.741-8.385,8.514-8.385s8.514,3.612,8.514,8.385ZM325.101,32.143v66.047h-13.932V32.143h13.932Z',
    'M413.979,85.935v12.255h-13.416c-12.642,0-17.931-5.934-17.931-17.931v-35.861h-25.542v53.792h-14.061v-53.792h-11.48v-12.255h11.48v-6.579c0-11.609,5.676-17.672,18.446-17.672h11.739v12.255h-9.804c-4.515,0-6.321,1.935-6.321,6.45v5.547h25.542V13.696h13.932v18.447h15.996v12.255h-15.996v34.442c0,5.16,1.935,7.095,6.966,7.095h10.449Z',
    'M482.993,61.813v36.377h-13.933v-35.604c0-12.513-5.547-19.221-15.866-19.221-10.965,0-17.673,8.127-17.673,21.414v33.41h-13.932V7.892h13.932v33.797c4.128-5.676,10.449-10.32,20.769-10.32,14.319,0,26.703,7.74,26.703,30.444Z',
  ],
  season: [
    'M254.799,170.779c.774,10.577,9.159,17.672,21.801,17.672,10.707,0,18.446-4.772,18.446-13.415,0-9.546-9.416-11.61-23.735-14.19-14.964-2.579-29.153-7.353-29.153-25.283,0-15.608,13.158-26.573,32.12-26.573,19.737,0,33.281,11.738,34.056,27.992h-14.577c-1.031-9.159-8.643-15.479-19.479-15.479-10.19,0-17.285,4.515-17.285,13.028,0,9.288,9.287,11.223,23.478,13.674,14.964,2.709,29.54,7.482,29.411,25.284,0,15.995-13.932,27.477-33.41,27.477-21.801,0-35.861-12.643-36.248-30.444l14.576.259Z',
    'M351.159,133.369c19.091,0,32.249,12.126,32.636,31.476,0,1.678-.129,3.483-.387,5.289h-49.793v.774c.645,11.352,7.481,18.704,18.446,18.704,8.514,0,14.706-4.257,16.641-11.609h13.932c-2.321,13.028-13.286,22.962-29.54,22.962-20.897,0-34.056-13.416-34.056-33.669,0-20.511,13.029-33.927,32.121-33.927ZM369.605,159.943c-1.161-9.804-8.256-15.351-17.931-15.351-8.901,0-16.512,5.934-17.544,15.351h35.475Z',
    'M458.226,188.064v12.126h-7.353c-9.03,0-12.126-3.999-12.126-10.578-4.386,6.708-11.094,11.353-21.801,11.353-14.448,0-24.51-7.096-24.51-19.351,0-13.544,9.804-21.155,28.251-21.155h16.641v-3.999c0-7.353-5.547-11.867-14.577-11.867-8.127,0-13.674,3.869-14.706,9.675h-13.674c1.42-13.287,12.385-20.898,29.025-20.898,17.543,0,27.734,8.386,27.734,23.994v26.058c0,3.354,1.677,4.644,4.386,4.644h2.709ZM437.328,170.779h-17.286c-8.514,0-13.416,3.225-13.416,9.933,0,5.547,4.645,9.417,12.255,9.417,11.61,0,18.318-6.837,18.447-17.028v-2.321Z',
    'M476.93,178.389c.516,6.837,6.837,11.739,16.383,11.739,8.385,0,14.189-3.354,14.189-8.772,0-6.966-5.934-7.61-15.995-8.9-14.835-1.806-26.703-4.902-26.703-18.576,0-12.513,11.223-20.769,26.832-20.64,16.124.129,27.477,7.611,28.379,21.156h-13.544c-.646-5.935-6.45-10.32-14.577-10.32s-13.545,3.354-13.545,8.644c0,6.191,6.321,6.707,15.737,7.868,14.835,1.677,27.09,5.031,27.09,19.737,0,12.642-11.867,20.64-27.734,20.64-17.544,0-29.54-8.256-29.928-22.575h13.416Z',
    'M530.076,167.167c0-20.124,13.545-33.798,33.669-33.798s33.668,13.674,33.668,33.798c0,20.253-13.545,33.798-33.668,33.798s-33.669-13.545-33.669-33.798ZM583.224,167.167c0-12.771-7.74-21.93-19.479-21.93s-19.35,9.159-19.35,21.93,7.61,21.93,19.35,21.93,19.479-9.159,19.479-21.93Z',
    'M670.039,163.813v36.377h-14.061v-35.604c0-12.513-5.289-19.221-15.738-19.221-11.094,0-17.672,8.127-17.672,21.543v33.281h-13.932v-66.047h12.126l1.548,8.643c4.127-5.159,10.448-9.417,21.155-9.417,14.191,0,26.574,7.611,26.574,30.444Z',
  ],
} as const;

/**
 * The wordmark glyphs in reading order, each with a stable key. Built once at
 * module scope so render never keys off an array index.
 */
export const WORDMARK_GLYPHS: ReadonlyArray<{ id: string; d: string }> = [
  ...WORDMARK.fifth.map((d, i) => ({ id: `fifth-${i}`, d })),
  ...WORDMARK.season.map((d, i) => ({ id: `season-${i}`, d })),
];

/** Gradient endpoints, exposed for ambience and UI that sits near the mark. */
export const BRAND = {
  green: '#A0DC96',
  teal: '#6DA1CE',
  violet: '#B27FD1',
  pink: '#EE79BB',
  blue: '#6080CA',
  indigo: '#31359A',
  plum: '#933D79',
  orange: '#F89A66',
} as const;

/**
 * `useId` returns ids containing characters that are not safe inside an SVG
 * `url(#…)` fragment reference — colons on React 18, guillemets on 19. Strip
 * everything that is not id-safe so gradients, masks and clips resolve.
 */
export function useSvgId() {
  return `fs${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
}

export function MarkGradients({ uid }: { uid: string }) {
  return (
    <>
      <linearGradient
        id={`${uid}-tl`}
        gradientUnits="userSpaceOnUse"
        x1="109"
        y1="5"
        x2="109"
        y2="214"
      >
        <stop offset="0" stopColor="#A0DC96" />
        <stop offset=".407" stopColor="#92D1A9" />
        <stop offset=".598" stopColor="#85C4BC" />
        <stop offset=".789" stopColor="#79B6CA" />
        <stop offset="1" stopColor="#6DA1CE" />
      </linearGradient>
      <linearGradient
        id={`${uid}-tr`}
        gradientUnits="userSpaceOnUse"
        x1="229"
        y1="5"
        x2="437"
        y2="214"
      >
        <stop offset="0" stopColor="#B27FD1" />
        <stop offset=".5" stopColor="#CE7CC7" />
        <stop offset="1" stopColor="#EE79BB" />
      </linearGradient>
      <linearGradient
        id={`${uid}-bl`}
        gradientUnits="userSpaceOnUse"
        x1="109"
        y1="229"
        x2="109"
        y2="437"
      >
        <stop offset="0" stopColor="#6080CA" />
        <stop offset=".293" stopColor="#525DC2" />
        <stop offset=".5" stopColor="#4C4FBA" />
        <stop offset=".726" stopColor="#3D41A9" />
        <stop offset="1" stopColor="#31359A" />
      </linearGradient>
      <linearGradient
        id={`${uid}-br`}
        gradientUnits="userSpaceOnUse"
        x1="229"
        y1="437"
        x2="437"
        y2="229"
      >
        <stop offset="0" stopColor="#933D79" />
        <stop offset=".159" stopColor="#9B4075" />
        <stop offset=".293" stopColor="#9E4174" />
        <stop offset=".5" stopColor="#B75970" />
        <stop offset=".707" stopColor="#E48369" />
        <stop offset=".841" stopColor="#F39166" />
        <stop offset="1" stopColor="#F89A66" />
      </linearGradient>
      <linearGradient
        id={`${uid}-star`}
        gradientUnits="userSpaceOnUse"
        x1="221"
        y1="145"
        x2="221"
        y2="298"
      >
        <stop offset="0" stopColor="#A098B9" />
        <stop offset=".5" stopColor="#8D7BB6" />
        <stop offset="1" stopColor="#775AAD" />
      </linearGradient>
    </>
  );
}

/** The five shapes, each carrying a stable class so CSS can address it. */
export function MarkShapes({
  uid,
  cellClassName = '',
}: {
  uid: string;
  cellClassName?: string;
}) {
  const cell = cellClassName ? ` ${cellClassName}` : '';
  return (
    <>
      <path className={`fs-tl${cell}`} d={MARK.tl} fill={`url(#${uid}-tl)`} />
      <path className={`fs-tr${cell}`} d={MARK.tr} fill={`url(#${uid}-tr)`} />
      <path className={`fs-br${cell}`} d={MARK.br} fill={`url(#${uid}-br)`} />
      <path className={`fs-bl${cell}`} d={MARK.bl} fill={`url(#${uid}-bl)`} />
      <path
        className={`fs-star${cell}`}
        d={MARK.star}
        fill={`url(#${uid}-star)`}
      />
    </>
  );
}

/** All five shapes as a clip/mask source. */
export function MarkSilhouette() {
  return (
    <>
      <path d={MARK.tl} />
      <path d={MARK.tr} />
      <path d={MARK.br} />
      <path d={MARK.bl} />
      <path d={MARK.star} />
    </>
  );
}

/** The static mark on its own, no motion. */
export function FifthSeasonMark({
  size = 48,
  className,
  title = 'Fifth Season',
}: {
  size?: number;
  className?: string;
  title?: string | null;
}) {
  const uid = useSvgId();
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      width={size}
      height={size}
      className={className}
      {...(title === null
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': title })}
    >
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <MarkShapes uid={uid} />
    </svg>
  );
}

/** The full horizontal lockup, static. Wordmark takes currentColor. */
export function FifthSeasonLockup({
  className,
  title = 'Fifth Season',
}: {
  className?: string;
  title?: string | null;
}) {
  const uid = useSvgId();
  return (
    <svg
      viewBox={LOCKUP_VIEWBOX}
      className={className}
      {...(title === null
        ? { 'aria-hidden': true }
        : { role: 'img', 'aria-label': title })}
    >
      <defs>
        <MarkGradients uid={uid} />
      </defs>
      <g transform={`scale(${LOCKUP_MARK_SCALE}) translate(-5 -5)`}>
        <MarkShapes uid={uid} />
      </g>
      <g fill="currentColor">
        {WORDMARK_GLYPHS.map((g) => (
          <path key={g.id} d={g.d} />
        ))}
      </g>
    </svg>
  );
}
