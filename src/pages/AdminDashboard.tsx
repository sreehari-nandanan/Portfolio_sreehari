import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api, AdminUser } from '../services/api';
import { AdminLayout, AdminTab } from '../components/admin/AdminLayout';
import { ToastContainer, ToastMessage } from '../components/admin/Toast';

import { OverviewTab } from './admin/OverviewTab';
import { ProjectsEditor, ProjectItem } from './admin/ProjectsEditor';
import { ProfileEditor, ProfileData } from './admin/ProfileEditor';
import { SkillsEditor, SkillsData } from './admin/SkillsEditor';
import { ExperienceEditor, ExperienceItem } from './admin/ExperienceEditor';
import { AchievementsEditor, AchievementItem } from './admin/AchievementsEditor';
import { EducationEditor, EducationItem } from './admin/EducationEditor';
import { CertificationsEditor, CertificationItem } from './admin/CertificationsEditor';
import { SettingsEditor, SiteSettingsData } from './admin/SettingsEditor';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [currentTab, setCurrentTab] = useState<AdminTab>('overview');
  const [saving, setSaving] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Stored state & SHAs for each file
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [projectsSha, setProjectsSha] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [profileSha, setProfileSha] = useState<string | null>(null);

  const [skills, setSkills] = useState<SkillsData | null>(null);
  const [skillsSha, setSkillsSha] = useState<string | null>(null);

  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [experienceSha, setExperienceSha] = useState<string | null>(null);

  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [achievementsSha, setAchievementsSha] = useState<string | null>(null);

  const [education, setEducation] = useState<EducationItem[]>([]);
  const [educationSha, setEducationSha] = useState<string | null>(null);

  const [certifications, setCertifications] = useState<CertificationItem[]>([]);
  const [certificationsSha, setCertificationsSha] = useState<string | null>(null);

  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [settingsSha, setSettingsSha] = useState<string | null>(null);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // 1. Check Authentication on Mount
  useEffect(() => {
    let isMounted = true;
    async function initAuth() {
      try {
        const authRes = await api.checkAuth();
        if (!isMounted) return;
        if (!authRes.authenticated || !authRes.user) {
          navigate('/signin', { replace: true });
          return;
        }
        setCurrentUser(authRes.user);
        setLoadingAuth(false);
      } catch (err) {
        if (isMounted) navigate('/signin', { replace: true });
      }
    }
    initAuth();
    return () => { isMounted = false; };
  }, [navigate]);

  // 2. Load all content files once authenticated
  const loadAllContent = useCallback(async () => {
    setLoadingData(true);
    try {
      const [
        pRes,
        profRes,
        skRes,
        expRes,
        achRes,
        eduRes,
        certRes,
        setRes,
      ] = await Promise.all([
        api.getContent<ProjectItem[]>('projects.json').catch(() => ({ content: [], sha: null })),
        api.getContent<ProfileData>('profile.json').catch(() => ({ content: {} as ProfileData, sha: null })),
        api.getContent<SkillsData>('skills.json').catch(() => ({ content: { skills: [], softwareTools: [] }, sha: null })),
        api.getContent<ExperienceItem[]>('experience.json').catch(() => ({ content: [], sha: null })),
        api.getContent<AchievementItem[]>('achievements.json').catch(() => ({ content: [], sha: null })),
        api.getContent<EducationItem[]>('education.json').catch(() => ({ content: [], sha: null })),
        api.getContent<CertificationItem[]>('certifications.json').catch(() => ({ content: [], sha: null })),
        api.getContent<SiteSettingsData>('site-settings.json').catch(() => ({ content: {} as SiteSettingsData, sha: null })),
      ]);

      setProjects(pRes.content || []);
      setProjectsSha(pRes.sha);

      setProfile(profRes.content || null);
      setProfileSha(profRes.sha);

      setSkills(skRes.content || null);
      setSkillsSha(skRes.sha);

      setExperience(expRes.content || []);
      setExperienceSha(expRes.sha);

      setAchievements(achRes.content || []);
      setAchievementsSha(achRes.sha);

      setEducation(eduRes.content || []);
      setEducationSha(eduRes.sha);

      setCertifications(certRes.content || []);
      setCertificationsSha(certRes.sha);

      setSettings(setRes.content || null);
      setSettingsSha(setRes.sha);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Loading Failed',
        message: err.message || 'Could not load content from GitHub or filesystem',
      });
    } finally {
      setLoadingData(false);
    }
  }, [addToast]);

  useEffect(() => {
    if (!loadingAuth && currentUser) {
      loadAllContent();
    }
  }, [loadingAuth, currentUser, loadAllContent]);

  // Handle Logout
  const handleLogout = async () => {
    await api.logout();
    navigate('/signin', { replace: true });
  };

  // Reusable Save Helper with Conflict Handling
  const handleSaveFile = async <T,>(
    fileName: string,
    data: T,
    currentSha: string | null,
    updateState: (data: T, newSha: string) => void,
    customMessage?: string
  ) => {
    setSaving(true);
    try {
      const res = await api.saveContent(fileName, data, currentSha, customMessage);
      updateState(data, res.sha);
      addToast({
        type: 'success',
        title: 'Committed to GitHub',
        message: `${fileName} saved successfully! ${res.commit ? `(Commit ${res.commit.slice(0, 7)})` : ''}`,
      });
    } catch (err: any) {
      if (err.isConflict) {
        addToast({
          type: 'error',
          title: 'SHA Conflict Detected',
          message: 'The file was updated on GitHub remotely. Please click Reload to sync the latest version before editing.',
          action: {
            label: 'Reload from GitHub',
            onClick: () => loadAllContent(),
          },
        });
      } else {
        addToast({
          type: 'error',
          title: 'Commit Failed',
          message: err.message || 'Failed to save changes to GitHub repository',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  if (loadingAuth || (loadingData && !profile)) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#09090b',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontFamily: 'Space Grotesk, sans-serif',
      }}>
        <Loader2 size={36} color="#FF5A00" className="animate-spin" />
        <div style={{ marginTop: '16px', fontSize: '0.9rem', color: '#71717a' }}>
          Connecting to GitHub repository & CMS...
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      user={currentUser}
      onLogout={handleLogout}
    >
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />

      {currentTab === 'overview' && (
        <OverviewTab
          onNavigate={setCurrentTab}
          stats={{
            projectsCount: projects.length,
            featuredCount: projects.filter((p) => p.featured).length,
            skillsCount: skills?.skills?.length || 0,
            toolsCount: skills?.softwareTools?.length || 0,
            experienceCount: experience.length,
            achievementsCount: achievements.length,
          }}
        />
      )}

      {currentTab === 'projects' && (
        <ProjectsEditor
          projects={projects}
          sha={projectsSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'projects.json',
              updated,
              projectsSha,
              (d, s) => {
                setProjects(d);
                setProjectsSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'profile' && profile && (
        <ProfileEditor
          profile={profile}
          sha={profileSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'profile.json',
              updated,
              profileSha,
              (d, s) => {
                setProfile(d);
                setProfileSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'skills' && skills && (
        <SkillsEditor
          skillsData={skills}
          sha={skillsSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'skills.json',
              updated,
              skillsSha,
              (d, s) => {
                setSkills(d);
                setSkillsSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'experience' && (
        <ExperienceEditor
          experience={experience}
          sha={experienceSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'experience.json',
              updated,
              experienceSha,
              (d, s) => {
                setExperience(d);
                setExperienceSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'achievements' && (
        <AchievementsEditor
          achievements={achievements}
          sha={achievementsSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'achievements.json',
              updated,
              achievementsSha,
              (d, s) => {
                setAchievements(d);
                setAchievementsSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'education' && (
        <EducationEditor
          education={education}
          sha={educationSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'education.json',
              updated,
              educationSha,
              (d, s) => {
                setEducation(d);
                setEducationSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'certifications' && (
        <CertificationsEditor
          certifications={certifications}
          sha={certificationsSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'certifications.json',
              updated,
              certificationsSha,
              (d, s) => {
                setCertifications(d);
                setCertificationsSha(s);
              },
              msg
            );
          }}
        />
      )}

      {currentTab === 'settings' && settings && (
        <SettingsEditor
          settings={settings}
          sha={settingsSha}
          saving={saving}
          onReload={loadAllContent}
          onSave={async (updated, msg) => {
            await handleSaveFile(
              'site-settings.json',
              updated,
              settingsSha,
              (d, s) => {
                setSettings(d);
                setSettingsSha(s);
              },
              msg
            );
          }}
        />
      )}
    </AdminLayout>
  );
};
