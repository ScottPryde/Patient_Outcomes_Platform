// Auto-discovery of Supabase configuration in Figma Make environment
// This attempts to discover the Supabase URL and fetch the anon key from the backend

export async function discoverSupabaseConfig(): Promise<{ supabaseUrl: string; supabaseAnonKey: string } | null> {
  try {
    console.log('🔍 Starting Supabase configuration auto-discovery...');
    
    if (typeof window === 'undefined') {
      console.log('❌ Window is undefined, cannot discover config');
      return null;
    }
    
    const currentHost = window.location.hostname;
    const currentProtocol = window.location.protocol;
    const currentPort = window.location.port;
    
    console.log('Current location:', {
      protocol: currentProtocol,
      hostname: currentHost,
      port: currentPort,
      href: window.location.href
    });
    
    // Build list of possible backend URLs to try
    const urlsToTry: string[] = [];
    
    // Pattern 1: If we're on *.supabase.co domain
    if (currentHost.includes('.supabase.co')) {
      const projectId = currentHost.split('.')[0];
      const supabaseUrl = `https://${projectId}.supabase.co`;
      urlsToTry.push(`${supabaseUrl}/functions/v1/make-server-e8005093/config`);
      console.log('✓ Detected Supabase hosting, project ID:', projectId);
    }
    
    // Pattern 2: Try relative path (same origin)
    urlsToTry.push(`${currentProtocol}//${currentHost}${currentPort ? ':' + currentPort : ''}/functions/v1/make-server-e8005093/config`);
    
    // Pattern 3: Try without /functions/v1 prefix (might be proxied)
    urlsToTry.push(`${currentProtocol}//${currentHost}${currentPort ? ':' + currentPort : ''}/make-server-e8005093/config`);
    
    // Pattern 4: Just relative paths
    urlsToTry.push('/functions/v1/make-server-e8005093/config');
    urlsToTry.push('/make-server-e8005093/config');
    
    console.log('Will try the following URLs:', urlsToTry);
    
    // Try each URL
    for (const url of urlsToTry) {
      try {
        console.log(`Attempting: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        console.log(`Response from ${url}:`, {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok,
          contentType: response.headers.get('content-type')
        });
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.supabaseUrl && data.supabaseAnonKey) {
              console.log('✅ Successfully discovered Supabase configuration!');
              console.log('Supabase URL:', data.supabaseUrl);
              console.log('Anon Key:', data.supabaseAnonKey.substring(0, 20) + '...');
              return {
                supabaseUrl: data.supabaseUrl,
                supabaseAnonKey: data.supabaseAnonKey
              };
            } else {
              console.log('❌ Response missing required fields');
            }
          } else {
            console.log('❌ Response is not JSON');
          }
        }
      } catch (error) {
        console.log(`❌ Failed to fetch from ${url}:`, error);
      }
    }
    
    console.log('❌ Auto-discovery failed - no valid configuration found');
    return null;
    
  } catch (error) {
    console.error('❌ Error during Supabase config discovery:', error);
    return null;
  }
}
