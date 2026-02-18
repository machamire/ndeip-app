-- ============================================================
-- NDEIP App — Supabase Database Schema
-- Run this in Supabase SQL Editor (supabase.com → SQL Editor)
-- ============================================================

-- ─── 1. Profiles (extends auth.users) ────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    display_name TEXT NOT NULL DEFAULT 'New User',
    avatar_url TEXT,
    about TEXT DEFAULT 'Hey there! I am using ndeip.',
    phone TEXT DEFAULT '',
    links TEXT[] DEFAULT '{}',
    dnd_mode TEXT DEFAULT 'available' CHECK (dnd_mode IN ('available', 'be_quiet', 'get_busy', 'do_not_disturb')),
    quiet_hours_start TEXT,
    quiet_hours_end TEXT,
    top3_contacts TEXT[] DEFAULT '{}',
    is_online BOOLEAN DEFAULT FALSE,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, display_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop if exists then create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─── 2. Conversations ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    is_group BOOLEAN DEFAULT FALSE,
    group_name TEXT,
    group_avatar TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 3. Conversation Members ────────────────────────────────
CREATE TABLE IF NOT EXISTS conversation_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    muted BOOLEAN DEFAULT FALSE,
    pinned BOOLEAN DEFAULT FALSE,
    starred BOOLEAN DEFAULT FALSE,
    last_read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, user_id)
);

-- ─── 4. Messages ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    text TEXT,
    type TEXT DEFAULT 'text' CHECK (type IN ('text', 'voice', 'image', 'video', 'file', 'system')),
    status TEXT DEFAULT 'sent' CHECK (status IN ('sending', 'sent', 'delivered', 'read')),
    audio_url TEXT,
    media_url TEXT,
    duration INTEGER, -- seconds, for voice/video
    ephemeral BOOLEAN DEFAULT FALSE,
    consumed BOOLEAN DEFAULT FALSE,
    reply_to UUID REFERENCES messages(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── 5. Call History ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS call_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    callee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('voice', 'video')),
    status TEXT DEFAULT 'missed' CHECK (status IN ('completed', 'missed', 'declined', 'no_answer')),
    duration INTEGER DEFAULT 0, -- seconds
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

-- ─── 6. Call Signals (WebRTC signaling — ephemeral) ─────────
CREATE TABLE IF NOT EXISTS call_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    callee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('offer', 'answer', 'ice-candidate', 'hangup', 'reject')),
    payload JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-delete old signals after 60 seconds (cleanup)
-- We'll handle this with a cron job or app-level cleanup

-- ─── 7. Row Level Security (RLS) ────────────────────────────

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE call_signals ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all profiles (for contact list), update only their own
CREATE POLICY "Anyone can view profiles"
    ON profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Conversations: only members can see conversations
CREATE POLICY "Members can view conversations"
    ON conversations FOR SELECT
    USING (
        id IN (
            SELECT conversation_id FROM conversation_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create conversations"
    ON conversations FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Conversation Members: members can see membership
CREATE POLICY "Members can view memberships"
    ON conversation_members FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_members cm
            WHERE cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can join conversations"
    ON conversation_members FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Messages: only conversation members can read/write
CREATE POLICY "Members can view messages"
    ON messages FOR SELECT
    USING (
        conversation_id IN (
            SELECT conversation_id FROM conversation_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Members can send messages"
    ON messages FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND conversation_id IN (
            SELECT conversation_id FROM conversation_members
            WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Sender can update own messages"
    ON messages FOR UPDATE
    USING (auth.uid() = sender_id);

-- Call History: users can see their own calls
CREATE POLICY "Users can view own call history"
    ON call_history FOR SELECT
    USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Authenticated users can create call history"
    ON call_history FOR INSERT
    WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Participants can update call history"
    ON call_history FOR UPDATE
    USING (auth.uid() = caller_id OR auth.uid() = callee_id);

-- Call Signals: users can see signals addressed to them
CREATE POLICY "Users can view own signals"
    ON call_signals FOR SELECT
    USING (auth.uid() = caller_id OR auth.uid() = callee_id);

CREATE POLICY "Authenticated users can create signals"
    ON call_signals FOR INSERT
    WITH CHECK (auth.uid() = caller_id);

CREATE POLICY "Users can delete own signals"
    ON call_signals FOR DELETE
    USING (auth.uid() = caller_id);

-- ─── 8. Indexes for performance ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversation_members_user ON conversation_members(user_id);
CREATE INDEX IF NOT EXISTS idx_conversation_members_conv ON conversation_members(conversation_id);
CREATE INDEX IF NOT EXISTS idx_call_history_users ON call_history(caller_id, callee_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_callee ON call_signals(callee_id, created_at DESC);

-- ─── 9. Enable Realtime ─────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE call_signals;
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;
