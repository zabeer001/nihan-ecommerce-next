"use client";

import Form from "next/form";
import { useRef, type ReactNode } from "react";

export function HomepageMenu({ children }: { children: ReactNode }) {
  const menu = useRef<HTMLDialogElement>(null);
  const search = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);

  return (
    <div className="homepage-menu">
      <button type="button" className="menu-trigger" aria-label="Menu" aria-haspopup="dialog" onClick={() => menu.current?.showModal()}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8h18M8 15h13" /></svg>
        <span>Menu</span>
      </button>
      <button
        type="button"
        className="menu-trigger"
        aria-label="Search"
        aria-haspopup="dialog"
        onClick={() => {
          search.current?.showModal();
          searchInput.current?.focus();
        }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m15.5 15.5 5 5" />
        </svg>
        <span>Search</span>
      </button>
      <dialog ref={menu} className="homepage-panel" aria-labelledby="homepage-menu-title">
        <div className="homepage-panel-heading">
          <h2 id="homepage-menu-title">Menu</h2>
          <button type="button" onClick={() => menu.current?.close()}>Close</button>
        </div>
        <nav aria-label="Main" onClick={event => {
          if (event.target instanceof Element && event.target.closest("a")) menu.current?.close();
        }}>
          {children}
        </nav>
      </dialog>
      <dialog ref={search} className="homepage-panel" aria-labelledby="homepage-search-title">
        <div className="homepage-panel-heading">
          <h2 id="homepage-search-title">Search</h2>
          <button type="button" onClick={() => search.current?.close()}>Close</button>
        </div>
        <Form action="/products" role="search" onSubmit={() => search.current?.close()}>
          <label htmlFor="homepage-search-query">Product name</label>
          <input ref={searchInput} id="homepage-search-query" type="search" name="q" maxLength={100} required />
          <button className="btn fill" type="submit">Search</button>
        </Form>
      </dialog>
    </div>
  );
}
