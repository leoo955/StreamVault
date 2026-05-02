"use client";

import React from "react";
import { Plus, LayoutGrid } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  isAdmin?: boolean;
}

/**
 * EmptyState component shown when no media is found in the database.
 */
export function EmptyState({ title, description, isAdmin = false }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center min-h-[400px]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center mb-8 shadow-2xl"
      >
        <LayoutGrid className="w-10 h-10 text-white/20" />
      </motion.div>
      
      <motion.h3 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-2xl md:text-3xl font-display font-light text-white mb-4"
      >
        {title}
      </motion.h3>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-white/40 max-w-md leading-relaxed mb-10"
      >
        {description}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        {isAdmin ? (
          <Link href="/admin" className="btn-primary group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>AJOUTER MON PREMIER MÉDIA</span>
          </Link>
        ) : (
          <Link href="/requests" className="btn-primary group">
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>DEMANDER UN FILM OU UNE SÉRIE</span>
          </Link>
        )}
      </motion.div>
    </div>
  );
}
