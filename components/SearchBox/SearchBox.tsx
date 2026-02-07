'use client';

import css from './SearchBox.module.css';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBox({ value, onChange }: SearchBoxProps) {
  return (
    <input
      className={css.input}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder="Search notes..."
    />
  );
}
