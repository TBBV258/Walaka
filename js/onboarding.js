let currentStep = 1;
let accountType = null;
let settings = {};

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize Supabase client
    if (!window.supabase) {
        console.error('Supabase client not initialized');
        return;
    }

    initializeSteps();
    populateIndustries();
    populateTemplates();
    populateColorThemes();
    setupEventListeners();
});

function initializeSteps() {
    // Check if user is already onboarded
    checkOnboardingStatus();

    // Setup account type selection
    document.querySelectorAll('.account-type').forEach(type => {
        type.addEventListener('click', function() {
            document.querySelectorAll('.account-type').forEach(t => t.classList.remove('selected'));
            this.classList.add('selected');
            accountType = this.dataset.type;
            document.querySelector('#step1 .next-btn').removeAttribute('disabled');
        });
    });

    // Setup form submissions
    setupFormSubmissions();
}

async function checkOnboardingStatus() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) {
            window.location.href = '/login.html';
            return;
        }

        const { data: profile, error } = await window.supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', session.user.id)
            .single();

        if (error) throw error;

        if (profile?.onboarding_completed) {
            window.location.href = '/dashboard.html';
        }
    } catch (error) {
        console.error('Error checking onboarding status:', error);
    }
}

function setupFormSubmissions() {
    // Company Form
    const companyForm = document.getElementById('companyForm');
    if (companyForm) {
        companyForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveCompanyInfo();
            goToStep(3);
        });
    }

    // Document Form
    const documentForm = document.getElementById('documentForm');
    if (documentForm) {
        documentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveDocumentSettings();
            await completeOnboarding();
            goToStep(4);
        });
    }
}

async function saveCompanyInfo() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) throw new Error('No session found');

        const companyData = {
            name: document.getElementById('companyName').value,
            industry: document.getElementById('industry').value,
            size: document.getElementById('companySize').value,
            user_id: session.user.id
        };

        // Handle logo upload if present
        const logoFile = document.getElementById('logo').files[0];
        if (logoFile) {
            const { data: logoData, error: uploadError } = await window.supabase.storage
                .from('company_logos')
                .upload(`${session.user.id}/${logoFile.name}`, logoFile);

            if (uploadError) throw uploadError;
            companyData.logo_url = logoData.path;
        }

        const { error } = await window.supabase
            .from('companies')
            .insert([companyData]);

        if (error) throw error;

    } catch (error) {
        console.error('Error saving company info:', error);
        showNotification('Error saving company information', 'error');
    }
}

async function saveDocumentSettings() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) throw new Error('No session found');

        const settings = {
            user_id: session.user.id,
            invoice_template: document.querySelector('.template-option.selected')?.dataset.template,
            color_theme: document.querySelector('.color-option.selected')?.dataset.color,
            invoice_prefix: document.getElementById('invoicePrefix').value
        };

        const { error } = await window.supabase
            .from('settings')
            .upsert([settings]);

        if (error) throw error;

    } catch (error) {
        console.error('Error saving document settings:', error);
        showNotification('Error saving document settings', 'error');
    }
}

async function completeOnboarding() {
    try {
        const { data: { session } } = await window.supabase.auth.getSession();
        if (!session) throw new Error('No session found');

        const { error } = await window.supabase
            .from('profiles')
            .update({ onboarding_completed: true })
            .eq('id', session.user.id);

        if (error) throw error;

    } catch (error) {
        console.error('Error completing onboarding:', error);
        showNotification('Error completing setup', 'error');
    }
}

function goToStep(step) {
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelectorAll('.step').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.step) <= step);
    });
    document.getElementById(`step${step}`).classList.add('active');
    currentStep = step;
}

// ... Helper functions for populating industries, templates, and color themes ...
