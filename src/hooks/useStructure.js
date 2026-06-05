/**
 * useStructure — manages the merged ETEC structure (static + custom overrides from DB).
 *
 * Logic:
 * - Static ETEC_STRUCTURE is the base.
 * - CustomDomain records can ADD new domains (is_custom=true) or RENAME existing ones (is_custom=false, matched by code).
 * - CustomStandard records can ADD new standards (is_custom=true) or RENAME existing ones (is_custom=false, matched by code).
 * - CustomIndicator records can ADD new indicators (is_custom=true), OVERRIDE desc (override_desc set), or MARK DELETED (is_deleted=true).
 */

import { useState, useEffect, useCallback } from "react";
import { base44 } from "@/api/base44Client";
import { ETEC_STRUCTURE as BASE_STRUCTURE } from "../utils/etecStructure";

const DOMAIN_COLORS = {
  purple: { bg: "bg-purple-600", light: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  blue:   { bg: "bg-blue-600",   light: "bg-blue-50 border-blue-200",     text: "text-blue-700"   },
  green:  { bg: "bg-green-600",  light: "bg-green-50 border-green-200",   text: "text-green-700"  },
  orange: { bg: "bg-orange-600", light: "bg-orange-50 border-orange-200", text: "text-orange-700" },
  teal:   { bg: "bg-teal-600",   light: "bg-teal-50 border-teal-200",     text: "text-teal-700"   },
  red:    { bg: "bg-red-600",    light: "bg-red-50 border-red-200",       text: "text-red-700"    },
};

export function useStructure() {
  const [customDomains, setCustomDomains]       = useState([]);
  const [customStandards, setCustomStandards]   = useState([]);
  const [customIndicators, setCustomIndicators] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    Promise.all([
      base44.entities.CustomDomain.list(),
      base44.entities.CustomStandard.list(),
      base44.entities.CustomIndicator.list(),
    ]).then(([d, s, i]) => {
      setCustomDomains(d);
      setCustomStandards(s);
      setCustomIndicators(i);
      setLoading(false);
    });
  }, []);

  useEffect(() => { reload(); }, [reload]);

  // ---- Build merged structure ----
  const structure = buildStructure(BASE_STRUCTURE, customDomains, customStandards, customIndicators);

  return { structure, loading, reload, customDomains, customStandards, customIndicators, DOMAIN_COLORS };
}

function buildStructure(base, cDomains, cStandards, cIndicators) {
  // Start with base domains, apply overrides
  let domains = base.map(d => {
    const override = cDomains.find(cd => cd.code === d.code && !cd.is_custom);
    return {
      ...d,
      name: override?.name || d.name,
      color: override?.color || d.color,
      _dbId: override?.id || null,
      standards: buildStandards(d.code, d.standards, cStandards, cIndicators),
    };
  });

  // Add completely new custom domains
  const newDomains = cDomains.filter(cd => cd.is_custom);
  newDomains.forEach(cd => {
    domains.push({
      domain: cd.name,
      name: cd.name,
      code: cd.code,
      color: cd.color || "teal",
      _dbId: cd.id,
      _isCustom: true,
      standards: buildStandards(cd.code, [], cStandards, cIndicators),
    });
  });

  // Sort by code
  domains.sort((a, b) => Number(a.code) - Number(b.code) || a.code.localeCompare(b.code));

  return domains;
}

function buildStandards(domainCode, baseStandards, cStandards, cIndicators) {
  let standards = baseStandards.map(s => {
    const override = cStandards.find(cs => cs.code === s.code && cs.domain_code === domainCode && !cs.is_custom);
    return {
      ...s,
      name: override?.name || s.name,
      _dbId: override?.id || null,
      indicators: buildIndicators(s.code, domainCode, s.indicators || [], cIndicators),
    };
  });

  // New custom standards for this domain
  const newStd = cStandards.filter(cs => cs.domain_code === domainCode && cs.is_custom);
  newStd.forEach(cs => {
    standards.push({
      name: cs.name,
      code: cs.code,
      _dbId: cs.id,
      _isCustom: true,
      indicators: buildIndicators(cs.code, domainCode, [], cIndicators),
    });
  });

  standards.sort((a, b) => a.code.localeCompare(b.code));
  return standards;
}

function buildIndicators(standardCode, domainCode, baseIndicators, cIndicators) {
  // Base indicators, apply overrides/deletions
  let indicators = baseIndicators
    .filter(i => {
      const del = cIndicators.find(ci => ci.code === i.code && ci.is_deleted);
      return !del;
    })
    .map(i => {
      const override = cIndicators.find(ci => ci.code === i.code && !ci.is_deleted && !ci.is_custom);
      return override
        ? { ...i, desc: override.override_desc || i.desc, tamayuz: override.tamayuz || i.tamayuz, tools: override.tools || i.tools, _dbId: override.id }
        : i;
    });

  // New custom indicators for this standard
  const newInds = cIndicators.filter(ci => ci.standard_code === standardCode && ci.domain_code === domainCode && ci.is_custom && !ci.is_deleted);
  newInds.forEach(ci => {
    indicators.push({
      code: ci.code,
      desc: ci.desc,
      tamayuz: ci.tamayuz || "",
      tools: ci.tools || [],
      _dbId: ci.id,
      _isCustom: true,
    });
  });

  return indicators;
}