import React from 'react';
import { Plus, MessageSquare, LogOut, Cpu, Sparkles, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({
  conversations,
  activeConvId,
  onSelectConv,
  onNewChat
}) {
  const { user, logout } = useAuth();

  return (
    <aside style={styles.sidebar}>
      {/* Brand Header */}
      <div style={styles.brand}>
        <div style={styles.logoIcon}>
          <Cpu size={22} color="#fff" />
        </div>
        <div>
          <h2 style={styles.brandTitle}>Enterprise AI</h2>
          <span style={styles.brandSub}>Gateway Platform</span>
        </div>
      </div>

      {/* New Chat Action */}
      <button onClick={onNewChat} style={styles.newChatBtn} className="btn-gradient">
        <Plus size={18} style={{ marginRight: 8 }} />
        New Conversation
      </button>

      {/* Conversations List */}
      <div style={styles.sectionHeader}>
        <span>Recent Conversations</span>
      </div>
      <div style={styles.convList}>
        {conversations.length === 0 ? (
          <div style={styles.emptyText}>No previous chats</div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConv(conv.id)}
              style={{
                ...styles.convItem,
                ...(conv.id === activeConvId ? styles.convItemActive : {})
              }}
            >
              <MessageSquare size={16} style={{ minWidth: 16, marginRight: 10, color: conv.id === activeConvId ? '#6366f1' : '#9ca3af' }} />
              <span style={styles.convTitle}>{conv.title}</span>
            </button>
          ))
        )}
      </div>

      {/* User Footer */}
      <div style={styles.userFooter}>
        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            <UserIcon size={16} color="#6366f1" />
          </div>
          <div style={styles.userDetails}>
            <div style={styles.userName}>{user?.email?.split('@')[0]}</div>
            <div style={styles.userRole}>{user?.role?.toUpperCase()}</div>
          </div>
        </div>
        <button onClick={logout} style={styles.logoutBtn} title="Logout">
          <LogOut size={18} color="#9ca3af" />
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: 'var(--sidebar-width)',
    height: '100vh',
    backgroundColor: 'rgba(11, 15, 25, 0.95)',
    borderRight: '1px solid var(--border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    padding: '20px 16px',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '24px',
    padding: '0 4px',
  },
  logoIcon: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    background: 'var(--accent-gradient)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)',
  },
  brandTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#fff',
    lineHeight: 1.2,
  },
  brandSub: {
    fontSize: '12px',
    color: 'var(--text-muted)',
  },
  newChatBtn: {
    width: '100%',
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
    fontSize: '14px',
  },
  sectionHeader: {
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    color: 'var(--text-dim)',
    marginBottom: '12px',
    paddingLeft: '4px',
  },
  convList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  emptyText: {
    fontSize: '13px',
    color: 'var(--text-dim)',
    padding: '12px 8px',
  },
  convItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '10px 12px',
    borderRadius: '8px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s ease',
    width: '100%',
  },
  convItemActive: {
    background: 'rgba(99, 102, 241, 0.15)',
    color: '#fff',
    border: '1px solid rgba(99, 102, 241, 0.3)',
  },
  convTitle: {
    fontSize: '13.5px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  userFooter: {
    paddingTop: '16px',
    marginTop: 'auto',
    borderTop: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    background: 'rgba(99, 102, 241, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#fff',
  },
  userRole: {
    fontSize: '10px',
    color: 'var(--accent-secondary)',
    fontWeight: 700,
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
  },
};
