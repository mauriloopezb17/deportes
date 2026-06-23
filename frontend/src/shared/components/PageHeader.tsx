import type { ReactNode } from "react";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actions?: ReactNode;
};

function PageHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  actions,
}: Props) {
  const hasLegacyAction = Boolean(actionLabel && onAction);

  return (
    <header className="page-header">
      <div className="page-header-copy">
        {eyebrow && <p className="page-eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>

      {(actions || hasLegacyAction) && (
        <div className="page-header-actions">
          {actions}
          {hasLegacyAction && (
            <button className="btn btn-primary" onClick={onAction}>
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default PageHeader;
