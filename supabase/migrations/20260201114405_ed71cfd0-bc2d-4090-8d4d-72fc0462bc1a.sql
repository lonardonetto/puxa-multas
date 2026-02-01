-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create system_settings table for global configurations including API keys
CREATE TABLE public.system_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value text,
    description text,
    is_secret boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Only super_admins can read/write system settings
CREATE POLICY "Super admins can manage system settings"
ON public.system_settings
FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.users
        WHERE users.id = auth.uid()
        AND users.role = 'super_admin'
    )
);

-- Insert default AI provider settings
INSERT INTO public.system_settings (key, value, description, is_secret) VALUES
('ai_provider', 'google', 'Provedor de IA ativo (google, openai, anthropic)', false),
('google_ai_api_key', '', 'Google AI (Gemini) API Key', true),
('openai_api_key', '', 'OpenAI API Key', true),
('anthropic_api_key', '', 'Anthropic (Claude) API Key', true);

-- Trigger for updated_at
CREATE TRIGGER update_system_settings_updated_at
BEFORE UPDATE ON public.system_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();