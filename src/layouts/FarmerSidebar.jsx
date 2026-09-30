import React from "react";
import Icon from "../core/Icon.jsx";
import { farmerNavSections, getActiveNavSectionId, matchesNavTarget } from "../data/navigation.js";

export default function FarmerSidebar({
  activeId,
  navSections = farmerNavSections,
  brandTitle = "Farmer Console",
  brandSubtitle = "Daily Operations",
  navLabel = "农户功能导航",
  profileTitle = "农户",
  profileSubtitle = "南区智慧农场",
  isCollapsed,
  openSectionIds,
  onToggleCollapsed,
  onOpenProfile,
  onNavigate,
  onToggleSection,
  onSwitchLogin
}) {
  const activeSectionId = getActiveNavSectionId(activeId, navSections);

  return (
    <aside className="app-nav">
      {!isCollapsed && (
        <button
          className="nav-close"
          type="button"
          aria-label="收起导航栏"
          onClick={onToggleCollapsed}
          title="收起导航栏"
        >
          <Icon name="close" />
        </button>
      )}
      <div className="console-brand">
        <button
          className="console-logo"
          type="button"
          title="切换登录"
          onClick={onSwitchLogin}
        >
          <Icon name="leaf" />
        </button>
        <strong>{brandTitle}</strong>
        <span>{brandSubtitle}</span>
      </div>
      <nav className="nav-sections" aria-label={navLabel}>
        {navSections.map((section) => {
          const hasChildren = (section.children ?? []).length > 0;
          const isActiveSection = section.id === activeSectionId;
          const isOpen = hasChildren && openSectionIds.includes(section.id);

          return (
            <div className="nav-section" key={section.id}>
              <button
                className={isActiveSection ? "nav-section-button active" : "nav-section-button"}
                type="button"
                aria-expanded={hasChildren ? isOpen : undefined}
                aria-pressed={!hasChildren ? isActiveSection : undefined}
                onClick={() => onToggleSection(section)}
              >
                <span className="nav-icon">
                  <Icon name={section.icon} />
                </span>
                <span className="nav-copy">
                  <strong>{section.label}</strong>
                  {isActiveSection && <small>{section.description}</small>}
                </span>
                {isActiveSection && <span className="nav-active-indicator" aria-hidden="true" />}
              </button>
              <span className="nav-tooltip" role="tooltip">
                <strong>{section.label}</strong>
                <small>{section.description}</small>
              </span>
              {hasChildren && isOpen && (
                <div className="nav-children">
                  {section.children.map((child) => {
                    const childActive = matchesNavTarget(child, activeId);

                    return (
                      <button
                        className={childActive ? "active" : ""}
                        key={child.targetId}
                        type="button"
                        aria-pressed={childActive}
                        onClick={() => onNavigate(child.targetId)}
                      >
                        <span>{child.short}</span>
                        <b>{child.label}</b>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
      <button
        className="profile-summary"
        type="button"
        aria-label="修改个人信息"
        onClick={isCollapsed ? onToggleCollapsed : onOpenProfile}
      >
        <span className="profile-avatar">
          <Icon name="user" />
        </span>
        <span className="profile-copy">
          <strong>{profileTitle}</strong>
          <small>{profileSubtitle}</small>
        </span>
        <span className="profile-edit" aria-hidden="true">
          <Icon name="edit" />
        </span>
        <span className="profile-tooltip" role="tooltip">
          <strong>{profileTitle}</strong>
          <small>{profileSubtitle}</small>
        </span>
      </button>
    </aside>
  );
}
