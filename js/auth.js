class Auth {
    constructor() {
        if (!window.supabase) {
            throw new Error('Supabase client not initialized');
        }
        this.supabase = window.supabase;
    }

    async signUp(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password
            });

            if (error) throw error;

            // Create profile
            await this.createProfile(data.user.id);

            // Insert default settings
            await this.insertDefaultSettings(data.user.id);

            return data;
        } catch (error) {
            console.error('Error in signup:', error);
            throw error;
        }
    }

    async createProfile(userId) {
        const { error } = await this.supabase
            .from('profiles')
            .insert([{
                id: userId,
                onboarding_completed: false
            }]);

        if (error) throw error;
    }

    async insertDefaultSettings(userId) {
        const { error } = await this.supabase
            .from('settings')
            .insert([{
                user_id: userId,
                invoice_template: 'default',
                color_theme: 'blue',
                language: 'en',
                currency: 'MZN'
            }]);

        if (error) throw error;
    }
}

window.auth = new Auth();
