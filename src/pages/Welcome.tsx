import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyPresentation } from '@/hooks/useCompanyPresentation';
import WelcomePresentation from '@/components/presentation/WelcomePresentation';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';

const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const { checkUserNeedsPresentation } = useCompanyPresentation();
  const [loading, setLoading] = useState(true);
  const [needsPresentation, setNeedsPresentation] = useState(false);
  const [allowSkip, setAllowSkip] = useState(false);

  useEffect(() => {
    const checkPresentationStatus = async () => {
      try {
        // Check if user needs to see presentation
        const needs = await checkUserNeedsPresentation();
        setNeedsPresentation(needs);

        // Check site settings for skip permission
        const { data: settings } = await supabase
          .from('site_settings')
          .select('setting_value')
          .eq('setting_key', 'presentation_skip_allowed')
          .single();

        setAllowSkip(settings?.setting_value === 'true');

        // If user doesn't need presentation, redirect to dashboard
        if (!needs) {
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.error('Error checking presentation status:', error);
        // On error, redirect to dashboard
        navigate('/dashboard', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    checkPresentationStatus();
  }, [checkUserNeedsPresentation, navigate]);

  const handleComplete = () => {
    navigate('/dashboard', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <Building2 className="h-12 w-12 text-primary mx-auto mb-4" />
          </div>
          <p className="text-lg font-medium text-foreground">
            Preparando apresentação...
          </p>
          <p className="text-sm text-muted-foreground">
            Aguarde enquanto carregamos as informações da empresa
          </p>
        </div>
      </div>
    );
  }

  if (!needsPresentation) {
    return null; // Will redirect in useEffect
  }

  return (
    <WelcomePresentation 
      onComplete={handleComplete}
      allowSkip={allowSkip}
    />
  );
};

export default Welcome;