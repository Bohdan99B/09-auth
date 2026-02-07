import css from './LayoutNotes.module.css';

interface FilterLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
}

export default function FilterLayout({ children, sidebar }: FilterLayoutProps) {
  return (
    <main>
      <div className={css.container}>
        <aside className={css.sidebar}>{sidebar}</aside>
        <section className={css.notesWrapper}>{children}</section>
      </div>
    </main>
  );
}
