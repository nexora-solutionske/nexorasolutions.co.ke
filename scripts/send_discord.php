<?php
// send_discord.php

// Allow cross-origin requests from your specific domain (replace with your actual domain)
// For development, you might use '*'. For production, specify your domain: 'https://yourdomain.com'
header("Access-Control-Allow-Origin: https://nexorasolutions.co.ke"); 
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight OPTIONS request for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

header('Content-Type: application/json'); // Ensure the response is JSON
ini_set('display_errors', 0); // Disable displaying errors for security in production
error_reporting(E_ALL); // Log all errors for debugging

// --- IMPORTANT: Replace with your actual Discord Webhook URL ---
// This URL should be kept secret and not exposed in client-side code.
$discordWebhookUrl = 'https://discord.com/api/webhooks/1393189296600645683/QA9iGohd9l356722WYtHBzI80kr64yRoeczw7M30WQbR5HSgVNZJ6NY-ERtRw9ns1zY_';
// -----------------------------------------------------------------

// Check if the webhook URL is set (ONLY check if it's empty)
if (empty($discordWebhookUrl)) { // <-- MODIFIED LINE HERE
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server webhook URL not configured. (URL is empty)']); // Added detail for clarity
    exit();
}

// Get the raw POST data (assuming JSON from fetch)
$input = file_get_contents('php://input');
$data = json_decode($input, true);

// Basic input validation
if (!isset($data['name'], $data['email'], $data['message'])) {
    http_response_code(400); // Bad Request
    echo json_encode(['success' => false, 'message' => 'Missing required form fields.']);
    exit();
}

$name = htmlspecialchars($data['name']); // Sanitize input
$email = htmlspecialchars($data['email']);
$subject = htmlspecialchars($data['subject'] ?? 'N/A'); // Use null coalescing for optional subject
$message = htmlspecialchars($data['message']);

// Construct Discord webhook payload (Embed format for better presentation)
$discordPayload = [
    'username' => 'Portfolio Contact Form', // Name that will appear in Discord
    'avatar_url' => 'https://via.placeholder.com/128?text=PF', // Optional: Custom avatar for the bot
    'embeds' => [
        [
            'title' => 'New Contact Form Submission',
            'color' => 15324480, // Decimal representation of #E94560 (your accent color)
            'fields' => [
                ['name' => 'Name', 'value' => $name, 'inline' => true],
                ['name' => 'Email', 'value' => $email, 'inline' => true],
                ['name' => 'Subject', 'value' => $subject, 'inline' => false],
                ['name' => 'Message', 'value' => $message, 'inline' => false]
            ],
            'timestamp' => date('c'), // ISO 8601 format for current time
            'footer' => [
                'text' => 'Sent from your website'
            ]
        ]
    ]
];

// Initialize cURL session
$ch = curl_init($discordWebhookUrl);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($discordPayload));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); // Return the response as a string

$response = curl_exec($ch); // Execute the cURL request
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE); // Get HTTP status code

if (curl_errno($ch)) {
    // cURL error occurred
    $error = curl_error($ch);
    error_log("cURL Error sending to Discord: " . $error);
    curl_close($ch);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Failed to connect to Discord API.']);
    exit();
}

curl_close($ch);

// Check Discord API response
if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Message sent successfully!']);
} else {
    // Discord API returned an error
    error_log("Discord API responded with error {$httpCode}: {$response}");
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Discord API error.']);
}

?>