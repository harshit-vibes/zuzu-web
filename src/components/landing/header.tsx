"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { usePostHog } from "posthog-js/react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/shared/brand-logo";
import { Menu, X, ChevronDown } from "lucide-react";
import { ThemeToggle } from "@/components/landing/theme-toggle";
import { cn } from "@/lib/utils";
import { getSignUpUrl, SIGN_IN_URL } from "@/lib/get-sign-up-url";

const TRACKS = [
  {
    slug: "python-foundations",
    label: "Python Foundations",
    href: "/learn#python-foundations",
    courses: [
      { label: "Introduction to Python", href: "/learn/intro-to-python" },
      { label: "Coding Fundamentals", href: "/learn/coding-fundamentals-python" },
      { label: "Data Types & Strings", href: "/learn/python-data-types-and-strings" },
      { label: "Lists & Dictionaries", href: "/learn/python-lists-and-dictionaries" },
      { label: "Files & File Handling", href: "/learn/python-files-and-file-handling" },
    ],
  },
  {
    slug: "pydantic-ai",
    label: "Pydantic & AI",
    href: "/learn#pydantic-ai",
    courses: [
      { label: "Master Pydantic", href: "/learn/master-pydantic-data-validation" },
      { label: "FastAPI + Pydantic", href: "/learn/fastapi-pydantic-apis" },
      { label: "Advanced Patterns", href: "/learn/advanced-pydantic-patterns" },
      { label: "Production Deployment", href: "/learn/pydantic-production-deployment" },
    ],
  },
];

const anchorLinks = [
  { label: "Method", href: "/#method" },
  { label: "Pricing", href: "/#pricing" },
];

export function Header() {
  const ph = usePostHog();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCoursesOpen, setIsCoursesOpen] = useState(false);
  const [activeTrack, setActiveTrack] = useState(0);
  const [isMobileCoursesOpen, setIsMobileCoursesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsCoursesOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleMouseEnter() {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsCoursesOpen(true);
  }

  function handleMouseLeave() {
    timeoutRef.current = setTimeout(() => setIsCoursesOpen(false), 150);
  }

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-300",
        isScrolled
          ? "border-b border-border/50 glass-premium"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-transparent logo-glow transition-all group-hover:from-primary/20">
              <BrandLogo width={24} height={24} className="opacity-90" />
            </div>
            <span className="font-display text-lg font-semibold text-gradient">zuzu.codes</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden items-center gap-8 md:flex">
            {/* Courses dropdown */}
            <div
              ref={dropdownRef}
              className="relative"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground nav-underline"
                onClick={() => setIsCoursesOpen(!isCoursesOpen)}
              >
                Courses
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isCoursesOpen && "rotate-180"
                )} />
              </button>

              {isCoursesOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2">
                  <div className="flex rounded-xl border border-border/60 bg-popover/95 backdrop-blur-lg shadow-lg overflow-hidden">
                    {/* Left column: tracks */}
                    <div className="w-44 border-r border-border/40 py-2 pl-2 pr-1 flex flex-col">
                      {TRACKS.map((track, idx) => (
                        <button
                          key={track.slug}
                          className={cn(
                            "text-left rounded-lg px-3 py-2 text-sm transition-colors",
                            idx === activeTrack
                              ? "bg-primary/10 text-foreground font-medium"
                              : "text-foreground/60 hover:bg-muted/50 hover:text-foreground"
                          )}
                          onMouseEnter={() => setActiveTrack(idx)}
                          onClick={() => setActiveTrack(idx)}
                        >
                          {track.label}
                        </button>
                      ))}
                      <div className="border-t border-border/40 mt-auto pt-1.5 pr-1">
                        <Link
                          href="/learn"
                          className="block rounded-lg px-3 py-2 text-sm text-primary/70 hover:bg-primary/5 hover:text-primary transition-colors font-medium"
                          onClick={() => setIsCoursesOpen(false)}
                        >
                          All Lessons →
                        </Link>
                      </div>
                    </div>
                    {/* Right column: courses for active track */}
                    <div className="w-52 py-2 pr-2 pl-1">
                      {TRACKS[activeTrack].courses.map(course => (
                        <Link
                          key={course.href}
                          href={course.href}
                          className="block rounded-lg px-3 py-1.5 text-sm text-foreground/70 hover:bg-primary/5 hover:text-foreground transition-colors"
                          onClick={() => setIsCoursesOpen(false)}
                        >
                          {course.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Anchor links */}
            {anchorLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground nav-underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />
            <Button size="sm" className="btn-shimmer" asChild>
              <a
                href={SIGN_IN_URL}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                  e.preventDefault();
                  ph?.capture('cta_clicked', { section: 'header', text: 'Get Started' });
                  window.location.assign(getSignUpUrl());
                }}
              >
                Get Started
              </a>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="border-t border-border py-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {/* Courses accordion */}
              <button
                className="flex items-center justify-between w-full px-1 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setIsMobileCoursesOpen(!isMobileCoursesOpen)}
              >
                Courses
                <ChevronDown className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isMobileCoursesOpen && "rotate-180"
                )} />
              </button>
              {isMobileCoursesOpen && (
                <div className="pl-4 space-y-3 mb-2 mt-1">
                  {TRACKS.map(track => (
                    <div key={track.slug}>
                      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50 mb-1 px-1">
                        {track.label}
                      </p>
                      {track.courses.map(course => (
                        <Link
                          key={course.href}
                          href={course.href}
                          className="block py-1.5 px-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {course.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                  <Link
                    href="/learn"
                    className="block py-1.5 px-1 text-sm text-primary/70 hover:text-primary transition-colors font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    All Lessons →
                  </Link>
                </div>
              )}

              {/* Anchor links */}
              {anchorLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="px-1 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex flex-col gap-2 pt-4">
                <Button size="sm" asChild>
                  <a
                    href={SIGN_IN_URL}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      ph?.capture('cta_clicked', { section: 'header', text: 'Get Started' });
                      window.location.assign(getSignUpUrl());
                    }}
                  >
                    Get Started
                  </a>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
