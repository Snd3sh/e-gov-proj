import {
  Accessibility,
  AlignJustify,
  AlignLeft,
  Bell,
  Building2,
  Check,
  ChevronDown,
  Circle,
  ClipboardCheck,
  Contrast,
  Database,
  EyeOff,
  FileBarChart,
  LayoutDashboard,
  Map as MapIcon,
  Menu,
  MousePointer2,
  MoveHorizontal,
  Network,
  Palette,
  PauseCircle,
  RefreshCw,
  Search,
  Settings,
  ShieldCheck,
  Type,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import NepalMap from "./components/NepalMap";
import emblem from "./assets/nepal-emblem.png";

const API_URL = "http://localhost:5000/api/municipalities";

const defaultAccess = {
  textSize: 1,
  contrast: false,
  align: "left",
  filter: "none",
  spacing: false,
  lineHeight: false,
  font: false,
  saturation: false,
  dyslexia: false,
  cursor: false,
  images: false,
  animations: false,
};

const accessTools = [
  { key: "textSize", title: "Text Size", icon: <Type size={44} /> },
  { key: "contrast", title: "High Contrast", icon: <Contrast size={44} /> },
  { key: "align", title: "Text Align", icon: <AlignLeft size={44} /> },
  { key: "filter", title: "Color Filter", icon: <Palette size={44} /> },
  { key: "spacing", title: "Text Spacing", icon: <MoveHorizontal size={44} /> },
  { key: "lineHeight", title: "Line Height", icon: <AlignJustify size={44} /> },
  { key: "font", title: "Font Selection", icon: <Type size={32} /> },
  { key: "saturation", title: "Saturation", icon: <Circle size={40} /> },
  {
    key: "dyslexia",
    title: "Dyslexia Friendly",
    icon: <span className="access-df-icon">Df</span>,
  },
  { key: "cursor", title: "Bigger Cursor", icon: <MousePointer2 size={46} /> },
  { key: "images", title: "Hide Images", icon: <EyeOff size={42} /> },
  {
    key: "animations",
    title: "Pause Animations",
    icon: <PauseCircle size={42} />,
  },
];

function App() {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [municipalities, setMunicipalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [search, setSearch] = useState("");
  const [accessOpen, setAccessOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("dashboard");
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [criticalOpen, setCriticalOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [municipalityDetails, setMunicipalityDetails] = useState(null);
  const [municipalityDetailsLoading, setMunicipalityDetailsLoading] =
    useState(false);
  const [municipalityDetailsError, setMunicipalityDetailsError] = useState("");
  const [access, setAccess] = useState(() => {
    try {
      const saved = localStorage.getItem("dgear-accessibility");
      return saved ? { ...defaultAccess, ...JSON.parse(saved) } : defaultAccess;
    } catch {
      return defaultAccess;
    }
  });

  useEffect(() => {
    let cancelled = false;

    async function loadMunicipalities() {
      try {
        setLoading(true);
        setApiError("");

        const response = await fetch(API_URL);

        if (!response.ok) {
          throw new Error(`API returned ${response.status}`);
        }

        const json = await response.json();

        if (!json.success || !Array.isArray(json.data)) {
          throw new Error("Invalid municipality API response");
        }

        if (!cancelled) {
          setMunicipalities(json.data);
        }
      } catch (error) {
        console.error("Municipality API error:", error);

        if (!cancelled) {
          setApiError(
            "Could not load municipality data. Make sure the backend is running on port 5000.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadMunicipalities();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("dgear-accessibility", JSON.stringify(access));
    } catch {
      // Ignore storage errors.
    }

    const root = document.documentElement;

    root.style.setProperty("--access-text-scale", String(access.textSize));
    root.style.setProperty("--access-text-align", access.align);

    root.style.setProperty(
      "--access-color-filter",
      access.filter === "grayscale"
        ? "grayscale(1)"
        : access.filter === "invert"
          ? "invert(1)"
          : "none",
    );

    const classMap = {
      "access-text-large": access.textSize !== 1,
      "access-high-contrast": access.contrast,
      "access-text-spacing": access.spacing,
      "access-line-height": access.lineHeight,
      "access-font": access.font,
      "access-saturation": access.saturation,
      "access-dyslexia": access.dyslexia,
      "access-bigger-cursor": access.cursor,
      "access-hide-images": access.images,
      "access-pause-animations": access.animations,
    };

    Object.entries(classMap).forEach(([className, enabled]) => {
      root.classList.toggle(className, enabled);
    });

    return () => {
      Object.keys(classMap).forEach((className) => {
        root.classList.remove(className);
      });
    };
  }, [access]);

  const filteredMunicipalities = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return municipalities;
    }

    return municipalities.filter((item) =>
      [item.province_name, item.municipality_name, item.readiness_level]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term)),
    );
  }, [municipalities, search]);

  const stats = useMemo(() => {
    const provinceCount = new Set(
      municipalities.map((item) => item.province_name).filter(Boolean),
    ).size;

    const scores = municipalities
      .map((item) => Number(item.total_score))
      .filter((value) => Number.isFinite(value));

    const average = scores.length
      ? scores.reduce((sum, value) => sum + value, 0) / scores.length
      : 0;

    const critical = municipalities.filter(
      (item) => String(item.readiness_level).toLowerCase() === "critical",
    ).length;

    const counts = municipalities.reduce(
      (result, item) => {
        const level = String(item.readiness_level || "Basic").toLowerCase();

        if (level === "advanced") result.advanced += 1;
        else if (level === "developing") result.developing += 1;
        else if (level === "critical") result.critical += 1;
        else result.basic += 1;

        return result;
      },
      { advanced: 0, developing: 0, basic: 0, critical: 0 },
    );

    return {
      provinceCount,
      municipalityCount: municipalities.length,
      average,
      critical,
      counts,
    };
  }, [municipalities]);

  function navigateTo(section, elementId) {
    setActiveNav(section);
    setMobileMenu(false);
    setNotificationOpen(false);
    setCriticalOpen(false);
    setProfileOpen(false);

    if (elementId) {
      window.setTimeout(() => {
        document.getElementById(elementId)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 0);
    }
  }

  function openSettings() {
    setActiveNav("settings");
    setMobileMenu(false);
    setNotificationOpen(false);
    setProfileOpen(false);
    window.setTimeout(() => {
      document.getElementById("settings-section")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 0);
  }

  async function openMunicipality(municipality) {
    const municipalityId = Number(municipality?.municipality_id);

    if (!Number.isInteger(municipalityId) || municipalityId <= 0) {
      console.error("Invalid municipality ID:", municipality?.municipality_id);
      return;
    }

    // Open the dialog immediately so the user gets feedback.
    setSelectedMunicipality(municipality);
    setMunicipalityDetails(null);
    setMunicipalityDetailsError("");
    setMunicipalityDetailsLoading(true);

    try {
      const detailUrl = `${API_URL}/details/${encodeURIComponent(municipalityId)}`;
      console.log("Loading municipality details:", detailUrl);

      const response = await fetch(detailUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(
          json?.message || `API returned HTTP ${response.status}`,
        );
      }

      if (!json?.success || !json?.data) {
        throw new Error(
          "The municipality detail API returned an invalid response.",
        );
      }

      // Expected API shape:
      // { success: true, data: { municipality, assessment, indicators } }
      const detail = json.data;

      setMunicipalityDetails({
        municipality: detail.municipality || {},
        assessment: detail.assessment || {},
        indicators: Array.isArray(detail.indicators) ? detail.indicators : [],
      });
    } catch (error) {
      console.error("Municipality detail API error:", error);
      setMunicipalityDetailsError(
        error?.message ||
          "Could not load the detailed assessment for this municipality.",
      );
    } finally {
      setMunicipalityDetailsLoading(false);
    }
  }

  function closeMunicipalityDetails() {
    setSelectedMunicipality(null);
    setMunicipalityDetails(null);
    setMunicipalityDetailsError("");
    setMunicipalityDetailsLoading(false);
  }

  function resetAccessibility() {
    setAccess({ ...defaultAccess });
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setAccessOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function useAccessTool(key) {
    setAccess((current) => {
      if (key === "textSize") {
        const values = [0.9, 1, 1.15, 1.3];
        const index = values.indexOf(current.textSize);

        return {
          ...current,
          textSize: values[(index + 1) % values.length],
        };
      }

      if (key === "align") {
        const values = ["left", "center", "right"];
        const index = values.indexOf(current.align);

        return {
          ...current,
          align: values[(index + 1) % values.length],
        };
      }

      if (key === "filter") {
        const values = ["none", "grayscale", "invert"];
        const index = values.indexOf(current.filter);

        return {
          ...current,
          filter: values[(index + 1) % values.length],
        };
      }

      const booleanKeys = [
        "contrast",
        "spacing",
        "lineHeight",
        "font",
        "saturation",
        "dyslexia",
        "cursor",
        "images",
        "animations",
      ];

      if (booleanKeys.includes(key)) {
        return {
          ...current,
          [key]: !current[key],
        };
      }

      return current;
    });
  }

  return (
    <div className="app">
      <div className="top-bar">
        <div className="top-bar-left">
          <img
            src="/src/assets/nepal-flag.png"
            alt="Nepal Flag"
            className="topbar-flag"
          />
          <span>Government of Nepal</span>
        </div>

        <div className="top-bar-right">Digital Government Initiative</div>
      </div>

      <header className="header">
        <div className="brand">
          <div className="emblem-wrapper">
            <img
              src={emblem}
              alt="National Emblem of Nepal"
              className="nepal-emblem"
            />
          </div>

          <div className="brand-text">
            <div className="brand-government">GOVERNMENT OF NEPAL</div>
            <div className="brand-name">D-GEAR Nepal</div>
            <div className="brand-subtitle">
              Digital Government Readiness Assessment System
            </div>
          </div>
        </div>

        <div className="header-right">
          <label className="search-box">
            <Search className="search-icon" size={21} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search municipality..."
              aria-label="Search municipality"
            />
          </label>

          <div className="header-action-wrap">
            <button
              className={`notification ${notificationOpen ? "open" : ""}`}
              aria-label="Notifications"
              aria-expanded={notificationOpen}
              onClick={() => {
                setNotificationOpen((value) => {
                  const next = !value;
                  if (!next) setCriticalOpen(false);
                  return next;
                });
                setProfileOpen(false);
              }}
            >
              <Bell size={27} />
              <span className="notification-dot" />
            </button>

            {notificationOpen && (
              <div className="notification-menu">
                <div className="dropdown-title">Notifications</div>
                <button
                  className="notification-item notification-critical"
                  onClick={() => setCriticalOpen((value) => !value)}
                  aria-expanded={criticalOpen}
                >
                  <span className="notification-item-dot" />
                  <span>
                    {stats.critical} municipalities require priority action.
                  </span>
                  <ChevronDown
                    size={16}
                    className={`notification-chevron ${criticalOpen ? "open" : ""}`}
                  />
                </button>

                {criticalOpen && (
                  <div className="critical-list">
                    {municipalities.filter(
                      (item) =>
                        String(item.readiness_level).toLowerCase() ===
                        "critical",
                    ).length === 0 ? (
                      <div className="critical-empty">
                        No critical municipalities found.
                      </div>
                    ) : (
                      municipalities
                        .filter(
                          (item) =>
                            String(item.readiness_level).toLowerCase() ===
                            "critical",
                        )
                        .map((item, index) => (
                          <button
                            key={`${item.municipality_name}-${index}`}
                            className="critical-municipality"
                            onClick={() => {
                              setSearch(item.municipality_name || "");
                              navigateTo(
                                "assessments",
                                "municipality-table-section",
                              );
                            }}
                          >
                            <span className="critical-name">
                              {item.municipality_name || "Unknown municipality"}
                            </span>
                            <span className="critical-province">
                              {item.province_name || "Province unavailable"}
                            </span>
                            <span className="critical-score">
                              {item.readiness_percentage != null
                                ? `${formatNumber(item.readiness_percentage)}%`
                                : "—"}
                            </span>
                          </button>
                        ))
                    )}
                  </div>
                )}
                <button
                  className="notification-item"
                  onClick={() => navigateTo("dashboard", "dashboard-top")}
                >
                  <span className="notification-item-dot blue" />
                  <span>Assessment data is up to date.</span>
                </button>
              </div>
            )}
          </div>

          <div className="header-action-wrap">
            <button
              className={`profile profile-button ${profileOpen ? "open" : ""}`}
              aria-label="Open administrator profile"
              aria-expanded={profileOpen}
              onClick={() => {
                setProfileOpen((value) => !value);
                setNotificationOpen(false);
              }}
            >
              <span className="profile-avatar">A</span>

              <span className="profile-info">
                <span className="profile-name">Administrator</span>
                <span className="profile-role">Government Analyst</span>
              </span>

              <ChevronDown className="profile-chevron" size={16} />
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-header">
                  <div className="profile-avatar small">A</div>
                  <div>
                    <strong>Administrator</strong>
                    <span>Government Analyst</span>
                  </div>
                </div>
                <button onClick={openSettings}>
                  <Settings size={17} />
                  Account Settings
                </button>
                <button onClick={() => setProfileOpen(false)}>
                  <X size={17} />
                  Close
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          className="mobile-menu-button"
          onClick={() => {
            setMobileMenu((value) => !value);
            setNotificationOpen(false);
            setProfileOpen(false);
          }}
          aria-label="Open navigation"
        >
          {mobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {mobileMenu && (
        <div className="mobile-nav">
          <MobileNav
            text="Dashboard"
            icon={<LayoutDashboard size={18} />}
            onClick={() => navigateTo("dashboard", "dashboard-top")}
            active={activeNav === "dashboard"}
          />
          <MobileNav
            text="Nepal Map"
            icon={<MapIcon size={18} />}
            onClick={() => navigateTo("map", "map-section")}
            active={activeNav === "map"}
          />
          <MobileNav
            text="Assessments"
            icon={<ClipboardCheck size={18} />}
            onClick={() =>
              navigateTo("assessments", "municipality-table-section")
            }
            active={activeNav === "assessments"}
          />
          <MobileNav
            text="Municipalities"
            icon={<Building2 size={18} />}
            onClick={() =>
              navigateTo("municipalities", "municipality-table-section")
            }
            active={activeNav === "municipalities"}
          />
          <MobileNav
            text="Reports"
            icon={<FileBarChart size={18} />}
            onClick={() => navigateTo("reports", "dimension-section")}
            active={activeNav === "reports"}
          />
          <MobileNav
            text="Settings"
            icon={<Settings size={18} />}
            onClick={openSettings}
            active={activeNav === "settings"}
          />
        </div>
      )}

      <div className="main-layout">
        <aside className="sidebar">
          <div className="nav-title">MAIN NAVIGATION</div>

          <nav>
            <NavItem
              icon={<LayoutDashboard size={18} />}
              text="Dashboard"
              active={activeNav === "dashboard"}
              onClick={() => navigateTo("dashboard", "dashboard-top")}
            />
            <NavItem
              icon={<MapIcon size={18} />}
              text="Nepal Map"
              active={activeNav === "map"}
              onClick={() => navigateTo("map", "map-section")}
            />
            <NavItem
              icon={<ClipboardCheck size={18} />}
              text="Assessments"
              active={activeNav === "assessments"}
              onClick={() =>
                navigateTo("assessments", "municipality-table-section")
              }
            />
            <NavItem
              icon={<Building2 size={18} />}
              text="Municipalities"
              active={activeNav === "municipalities"}
              onClick={() =>
                navigateTo("municipalities", "municipality-table-section")
              }
            />
            <NavItem
              icon={<FileBarChart size={18} />}
              text="Reports"
              active={activeNav === "reports"}
              onClick={() => navigateTo("reports", "dimension-section")}
            />
          </nav>

          <div className="sidebar-divider" />

          <div className="system-title">SYSTEM</div>

          <NavItem
            icon={<Settings size={18} />}
            text="Settings"
            active={activeNav === "settings"}
            onClick={openSettings}
          />

          <div className="system-status">
            <div className="system-status-header">
              <span className="system-status-dot" />
              <span>System Operational</span>
            </div>

            <p>D-GEAR monitoring services are currently operational.</p>
          </div>
        </aside>

        <main className="content">
          <div className="page-content" id="dashboard-top">
            <div className="breadcrumb">
              <span className="current">Home</span>
              <span className="breadcrumb-separator">/</span>
              <span>Dashboard</span>
            </div>

            <h2 className="page-title">National Digital Readiness Overview</h2>

            <p className="page-description">
              Monitoring digital government readiness, accessibility,
              infrastructure and e-service capacity across selected
              municipalities of Nepal.
            </p>

            {apiError && <div className="error-message">{apiError}</div>}

            <div className="info-banner">
              <ShieldCheck className="info-banner-icon" size={22} />

              <div className="info-banner-content">
                <div className="info-banner-title">
                  DIGITAL GOVERNMENT READINESS MONITORING
                </div>

                <div className="info-banner-text">
                  D-GEAR provides evidence-based assessment of municipal
                  readiness for digital public service delivery.
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <StatCard
                title="PROVINCES COVERED"
                value={loading ? "—" : stats.provinceCount}
                description="Provinces represented in assessments"
                icon={<MapIcon size={24} />}
              />

              <StatCard
                title="MUNICIPALITIES ASSESSED"
                value={loading ? "—" : stats.municipalityCount}
                description="Municipalities in the database"
                icon={<Building2 size={24} />}
              />

              <StatCard
                title="AVERAGE DESRI"
                value={loading ? "—" : stats.average.toFixed(1)}
                description="Average total assessment score"
                icon={<MonitorIcon />}
              />

              <StatCard
                title="CRITICAL GAPS"
                value={loading ? "—" : stats.critical}
                description="Require priority action"
                icon={<ShieldCheck size={24} />}
                critical
              />
            </div>

            <div className="dashboard-grid">
              <section className="card map-card" id="map-section">
                <div className="card-header">
                  <div className="card-header-text">
                    <h3>
                      <MapIcon size={19} className="inline-icon" />
                      Municipal Digital Readiness Map
                    </h3>

                    <p>Geographic distribution of assessed municipalities</p>
                  </div>

                  <button className="view-map-button">View Full Map</button>
                </div>

                <div className="map-container">
                  <NepalMap />
                </div>

                <div className="map-legend">
                  <Legend className="advanced" text="Advanced" />
                  <Legend className="developing" text="Developing" />
                  <Legend className="basic" text="Basic" />
                  <Legend className="critical" text="Critical" />
                </div>
              </section>

              <section className="card distribution-card">
                <div className="card-header">
                  <div className="card-header-text">
                    <h3>
                      <FileBarChart size={19} className="inline-icon" />
                      Readiness Distribution
                    </h3>

                    <p>Municipality classification</p>
                  </div>
                </div>

                <div className="distribution-list">
                  <Distribution
                    label="Advanced"
                    count={stats.counts.advanced}
                    total={stats.municipalityCount}
                  />

                  <Distribution
                    label="Developing"
                    count={stats.counts.developing}
                    total={stats.municipalityCount}
                  />

                  <Distribution
                    label="Basic"
                    count={stats.counts.basic}
                    total={stats.municipalityCount}
                  />

                  <Distribution
                    label="Critical"
                    count={stats.counts.critical}
                    total={stats.municipalityCount}
                  />
                </div>
              </section>
            </div>

            <section
              className="card table-card"
              id="municipality-table-section"
            >
              <div className="table-header">
                <h2>Municipality Readiness</h2>
                <p>Latest digital government assessment results</p>
              </div>

              <div className="table-wrapper">
                {loading ? (
                  <div className="loading">Loading municipality data...</div>
                ) : filteredMunicipalities.length === 0 ? (
                  <div className="loading">No municipalities found.</div>
                ) : (
                  <table className="municipality-table">
                    <thead>
                      <tr>
                        <th>Province</th>
                        <th>Municipality</th>
                        <th>Total Score</th>
                        <th>Readiness %</th>
                        <th>Level</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredMunicipalities.map((item, index) => (
                        <tr
                          key={`${item.municipality_name}-${index}`}
                          className="municipality-row"
                          onClick={() => openMunicipality(item)}
                          tabIndex={0}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              openMunicipality(item);
                            }
                          }}
                          title="Click to view municipality assessment details"
                        >
                          <td>{item.province_name || "—"}</td>

                          <td className="municipality-name">
                            <button
                              type="button"
                              className="municipality-link"
                              onClick={(event) => {
                                event.stopPropagation();
                                openMunicipality(item);
                              }}
                            >
                              {item.municipality_name || "—"}
                            </button>
                          </td>

                          <td>{formatNumber(item.total_score)}</td>

                          <td>
                            {item.readiness_percentage != null
                              ? `${formatNumber(item.readiness_percentage)}%`
                              : "—"}
                          </td>

                          <td>
                            <span
                              className={`readiness-badge ${getLevelClass(
                                item.readiness_level,
                              )}`}
                            >
                              {item.readiness_level || "—"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </section>

            <section className="card dimension-card" id="dimension-section">
              <div className="table-header">
                <h2>DESRI Dimension Overview</h2>
                <p>
                  Average readiness across key digital government dimensions
                </p>
              </div>

              <div className="dimension-grid">
                <Dimension
                  icon={<Wifi size={20} />}
                  name="Connectivity"
                  score={72}
                />

                <Dimension
                  icon={<MonitorIcon />}
                  name="Digital Infrastructure"
                  score={65}
                />

                <Dimension
                  icon={<Users size={20} />}
                  name="Digital Literacy"
                  score={58}
                />

                <Dimension
                  icon={<Network size={20} />}
                  name="E-Service Availability"
                  score={71}
                />

                <Dimension
                  icon={<Building2 size={20} />}
                  name="ICT Human Resources"
                  score={49}
                />

                <Dimension
                  icon={<Users size={20} />}
                  name="Digital Inclusion"
                  score={55}
                />

                <Dimension
                  icon={<Database size={20} />}
                  name="Data Management"
                  score={62}
                />
              </div>
            </section>

            <section className="card settings-section" id="settings-section">
              <div className="table-header">
                <h2>System Settings</h2>
                <p>Quick controls for the D-GEAR dashboard.</p>
              </div>

              <div className="settings-grid">
                <div className="settings-card">
                  <Settings size={24} className="settings-card-icon" />
                  <strong>Accessibility</strong>
                  <span>
                    Customize text size, contrast, spacing, fonts, cursor and
                    other accessibility options.
                  </span>
                  <button
                    className="settings-action"
                    onClick={() => setAccessOpen(true)}
                  >
                    Open Accessibility Tools
                  </button>
                </div>

                <div className="settings-card">
                  <Database size={24} className="settings-card-icon" />
                  <strong>Data Source</strong>
                  <span>
                    Municipality readiness data is loaded from the
                    PostgreSQL-backed API.
                  </span>
                  <span
                    className={`settings-status ${loading ? "loading" : apiError ? "error" : "online"}`}
                  >
                    {loading
                      ? "Loading data..."
                      : apiError
                        ? "API connection needs attention"
                        : "API connected"}
                  </span>
                </div>

                <div className="settings-card">
                  <RefreshCw size={24} className="settings-card-icon" />
                  <strong>Reset Accessibility</strong>
                  <span>
                    Return all accessibility settings to their default values.
                  </span>
                  <button
                    className="settings-action secondary"
                    onClick={resetAccessibility}
                  >
                    Reset Accessibility
                  </button>
                </div>

                <div className="settings-card">
                  <Wifi size={24} className="settings-card-icon" />
                  <strong>Dashboard</strong>
                  <span>
                    Reload the dashboard and fetch the latest municipality data
                    from the API.
                  </span>
                  <button
                    className="settings-action secondary"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Dashboard
                  </button>
                </div>
              </div>
            </section>

            <footer className="footer">
              <div>
                <strong>D-GEAR Nepal</strong>
                <span>Digital Government Readiness Assessment System</span>
              </div>

              <div className="footer-right">
                <span>Prototype Version 1.0</span>
                <span>Government-oriented academic prototype</span>
              </div>
            </footer>
          </div>
        </main>
      </div>

      {selectedMunicipality && (
        <div
          className="municipality-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeMunicipalityDetails();
            }
          }}
        >
          <section
            className="municipality-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="municipality-detail-title"
          >
            <div className="municipality-modal-header">
              <div>
                <div className="municipality-modal-kicker">
                  MUNICIPALITY ASSESSMENT
                </div>
                <h2 id="municipality-detail-title">
                  {municipalityDetails?.municipality?.municipality_name ||
                    selectedMunicipality.municipality_name}
                </h2>
                <p>
                  {municipalityDetails?.municipality?.province_name ||
                    selectedMunicipality.province_name ||
                    "Province unavailable"}
                </p>
              </div>

              <button
                className="municipality-modal-close"
                onClick={closeMunicipalityDetails}
                aria-label="Close municipality details"
              >
                <X size={26} />
              </button>
            </div>

            {municipalityDetailsLoading ? (
              <div className="municipality-detail-loading">
                Loading assessment details...
              </div>
            ) : municipalityDetailsError ? (
              <div className="municipality-detail-error">
                {municipalityDetailsError}
              </div>
            ) : municipalityDetails ? (
              <>
                <div className="municipality-summary-grid">
                  <div>
                    <span>Total Score</span>
                    <strong>
                      {formatNumber(
                        municipalityDetails.assessment?.total_score,
                      )}
                    </strong>
                  </div>
                  <div>
                    <span>Readiness</span>
                    <strong>
                      {municipalityDetails.assessment?.readiness_percentage !=
                      null
                        ? `${formatNumber(
                            municipalityDetails.assessment.readiness_percentage,
                          )}%`
                        : "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Level</span>
                    <strong
                      className={`detail-level ${getLevelClass(
                        municipalityDetails.assessment?.readiness_level,
                      )}`}
                    >
                      {municipalityDetails.assessment?.readiness_level || "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Assessment Year</span>
                    <strong>
                      {municipalityDetails.assessment?.assessment_year || "—"}
                    </strong>
                  </div>
                </div>

                <div className="municipality-detail-section">
                  <div className="municipality-detail-heading">
                    <h3>Assessment Dimensions</h3>
                    <p>
                      Scores are loaded directly from this municipality's
                      assessment records.
                    </p>
                  </div>

                  <div className="municipality-dimensions">
                    {groupIndicatorsByCategory(
                      municipalityDetails.indicators || [],
                    ).map((group) => (
                      <DimensionGroup
                        key={group.category}
                        category={group.category}
                        indicators={group.indicators}
                      />
                    ))}
                  </div>
                </div>

                <div className="municipality-detail-section municipality-meta">
                  <div>
                    <span>Municipality Type</span>
                    <strong>
                      {municipalityDetails.municipality?.municipality_type ||
                        "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Population</span>
                    <strong>
                      {municipalityDetails.municipality?.population != null
                        ? Number(
                            municipalityDetails.municipality.population,
                          ).toLocaleString()
                        : "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Assessed By</span>
                    <strong>
                      {municipalityDetails.assessment?.assessed_by || "—"}
                    </strong>
                  </div>
                  <div>
                    <span>Assessment Date</span>
                    <strong>
                      {municipalityDetails.assessment?.assessment_date
                        ? new Date(
                            municipalityDetails.assessment.assessment_date,
                          ).toLocaleDateString()
                        : "—"}
                    </strong>
                  </div>
                </div>

                {municipalityDetails.assessment?.remarks && (
                  <div className="municipality-remarks">
                    <strong>Assessment Remarks</strong>
                    <p>{municipalityDetails.assessment.remarks}</p>
                  </div>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}

      <button
        className="accessibility-button"
        onClick={() => setAccessOpen(true)}
        aria-label="Open accessibility tools"
        title="Accessibility Tools"
      >
        <Accessibility size={29} />
      </button>

      {accessOpen && (
        <div
          className="accessibility-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setAccessOpen(false);
            }
          }}
        >
          <aside
            className="accessibility-panel"
            aria-label="Accessibility tools"
          >
            <div className="accessibility-header">
              <h2>Accessibility Tools</h2>

              <div className="accessibility-header-actions">
                <button
                  onClick={resetAccessibility}
                  aria-label="Reset accessibility settings"
                  title="Reset"
                >
                  <RefreshCw size={30} />
                </button>

                <button
                  onClick={() => setAccessOpen(false)}
                  aria-label="Close accessibility tools"
                  title="Close"
                >
                  <X size={34} />
                </button>
              </div>
            </div>

            <div className="accessibility-grid">
              {accessTools.map((tool) => {
                const selected =
                  tool.key === "textSize"
                    ? access.textSize !== 1
                    : tool.key === "align"
                      ? access.align !== "left"
                      : tool.key === "filter"
                        ? access.filter !== "none"
                        : Boolean(access[tool.key]);

                return (
                  <button
                    key={tool.key}
                    className={`accessibility-tool ${
                      selected ? "selected" : ""
                    }`}
                    onClick={() => useAccessTool(tool.key)}
                  >
                    <span className="tool-icon">{tool.icon}</span>
                    <span className="tool-title">{tool.title}</span>

                    <span className="tool-bars" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>

                    {selected && (
                      <span className="tool-check">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function MonitorIcon() {
  return <span className="monitor-icon">▤</span>;
}

function NavItem({ icon, text, active = false, onClick }) {
  return (
    <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}>
      <span className="nav-item-icon">{icon}</span>
      <span>{text}</span>
    </button>
  );
}

function MobileNav({ icon, text, active = false, onClick }) {
  return (
    <button
      className={`mobile-nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {icon}
      <span>{text}</span>
    </button>
  );
}

function StatCard({ title, value, description, icon, critical = false }) {
  return (
    <div className={`stat-card ${critical ? "critical" : ""}`}>
      <div className="stat-card-content">
        <div className="stat-label">{title}</div>
        <div className="stat-value">{value}</div>
        <div className="stat-description">{description}</div>
      </div>

      <div className="stat-icon">{icon}</div>
    </div>
  );
}

function Distribution({ label, count, total }) {
  const percentage = total ? Math.round((count / total) * 100) : 0;

  return (
    <div className="distribution-item">
      <div className="distribution-header">
        <span className="distribution-name">{label}</span>
        <span className="distribution-count">{count} municipalities</span>
      </div>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${percentage}%` }} />
      </div>

      <div className="distribution-percentage">{percentage}%</div>
    </div>
  );
}

function Dimension({ icon, name, score }) {
  return (
    <div className="dimension">
      <div className="dimension-top">
        <span className="dimension-icon">{icon}</span>
        <strong>{score}</strong>
      </div>

      <div className="dimension-name">{name}</div>

      <div className="dimension-progress">
        <span style={{ width: `${score}%` }} />
      </div>
    </div>
  );
}

function groupIndicatorsByCategory(indicators) {
  const groups = new globalThis.Map();

  indicators.forEach((indicator) => {
    const category = indicator.category || "Other";

    if (!groups.has(category)) {
      groups.set(category, []);
    }

    groups.get(category).push(indicator);
  });

  return Array.from(groups, ([category, categoryIndicators]) => ({
    category,
    indicators: categoryIndicators,
  }));
}

function DimensionGroup({ category, indicators }) {
  const totalMax = indicators.reduce(
    (sum, indicator) => sum + Number(indicator.max_score || 5),
    0,
  );

  const totalScore = indicators.reduce(
    (sum, indicator) => sum + Number(indicator.score || 0),
    0,
  );

  const percentage = totalMax ? (totalScore / totalMax) * 100 : 0;

  return (
    <article className="municipality-dimension-group">
      <div className="municipality-dimension-header">
        <div>
          <h4>{category}</h4>
          <span>
            {formatNumber(totalScore)} / {formatNumber(totalMax)}
          </span>
        </div>

        <strong>{Math.round(percentage)}%</strong>
      </div>

      <div className="municipality-dimension-progress">
        <span style={{ width: `${percentage}%` }} />
      </div>

      <div className="indicator-list">
        {indicators.map((indicator) => (
          <div className="indicator-row" key={indicator.indicator_id}>
            <div className="indicator-info">
              <strong>{indicator.indicator_name}</strong>
              {indicator.description && <span>{indicator.description}</span>}
            </div>

            <div className="indicator-score">
              <strong>{formatNumber(indicator.score)}</strong>
              <span>/ {formatNumber(indicator.max_score)}</span>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function Legend({ className, text }) {
  return (
    <div className="legend">
      <span className={`legend-dot ${className}`} />
      <span>{text}</span>
    </div>
  );
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return Number.isInteger(number) ? String(number) : number.toFixed(2);
}

function getLevelClass(level) {
  return String(level || "basic")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

export default App;
