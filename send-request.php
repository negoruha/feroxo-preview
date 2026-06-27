<?php
declare(strict_types=1);

if (function_exists('mb_internal_encoding')) {
    mb_internal_encoding('UTF-8');
}

$to = 'info@feroxo.cz';
$siteName = 'Feroxo';
$from = 'no-reply@feroxo.cz';
$maxFileSize = 10 * 1024 * 1024; // 10 MB

function clean_text(?string $value): string {
    $value = trim((string)$value);
    $value = str_replace(["\r", "\n"], ' ', $value);
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function clean_message(?string $value): string {
    return htmlspecialchars(trim((string)$value), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirect_to(string $target): never {
    header('Location: ' . $target, true, 303);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    redirect_to('error.html?reason=method');
}

$name = clean_text($_POST['name'] ?? '');
$company = clean_text($_POST['company'] ?? '');
$email = clean_text($_POST['email'] ?? '');
$phone = clean_text($_POST['phone'] ?? '');
$equipment = clean_text($_POST['equipment'] ?? '');
$message = clean_message($_POST['message'] ?? '');
$privacyAccepted = isset($_POST['privacy']) && $_POST['privacy'] !== '';

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !$privacyAccepted) {
    redirect_to('error.html?reason=validation');
}

$subject = 'Feroxo website request';
$bodyText = "New request from feroxo.cz\n\n";
$bodyText .= "Name: {$name}\n";
$bodyText .= "Company: " . ($company !== '' ? $company : '-') . "\n";
$bodyText .= "Email: {$email}\n";
$bodyText .= "Phone: " . ($phone !== '' ? $phone : '-') . "\n";
$bodyText .= "Equipment / product: " . ($equipment !== '' ? $equipment : '-') . "\n\n";
$bodyText .= "Message:\n" . ($message !== '' ? html_entity_decode($message, ENT_QUOTES, 'UTF-8') : '-') . "\n\n";
$bodyText .= "Sent from: " . ($_SERVER['HTTP_HOST'] ?? 'website') . "\n";
$bodyText .= "Date: " . date('Y-m-d H:i:s') . "\n";

$boundary = 'FEROXO-' . md5((string) time() . random_int(1000, 9999));
$headers = [
    'MIME-Version: 1.0',
    'From: ' . $siteName . ' Website <' . $from . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',
    'Content-Type: multipart/mixed; boundary="' . $boundary . '"',
];

$emailBody = "--{$boundary}\r\n";
$emailBody .= "Content-Type: text/plain; charset=UTF-8\r\n";
$emailBody .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$emailBody .= $bodyText . "\r\n";

if (!empty($_FILES['attachment']) && is_uploaded_file($_FILES['attachment']['tmp_name'])) {
    $upload = $_FILES['attachment'];
    if ($upload['size'] <= $maxFileSize && $upload['error'] === UPLOAD_ERR_OK) {
        $fileName = preg_replace('/[^A-Za-z0-9._ -]/', '_', basename((string) $upload['name'])) ?: 'attachment';
        $fileType = 'application/octet-stream';
        if (function_exists('finfo_open')) {
            $finfo = finfo_open(FILEINFO_MIME_TYPE);
            if ($finfo !== false) {
                $detected = finfo_file($finfo, $upload['tmp_name']);
                finfo_close($finfo);
                if (is_string($detected) && preg_match('#^[A-Za-z0-9.+-]+/[A-Za-z0-9.+-]+$#', $detected)) {
                    $fileType = $detected;
                }
            }
        }
        $fileContent = chunk_split(base64_encode((string) file_get_contents($upload['tmp_name'])));
        $emailBody .= "--{$boundary}\r\n";
        $emailBody .= "Content-Type: {$fileType}; name=\"{$fileName}\"\r\n";
        $emailBody .= "Content-Transfer-Encoding: base64\r\n";
        $emailBody .= "Content-Disposition: attachment; filename=\"{$fileName}\"\r\n\r\n";
        $emailBody .= $fileContent . "\r\n";
    } else {
        $emailBody .= "\r\nAttachment was not sent because the file is too large or upload failed.\r\n";
    }
}

$emailBody .= "--{$boundary}--\r\n";
$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$sent = mail($to, $encodedSubject, $emailBody, implode("\r\n", $headers));

redirect_to($sent ? 'thank-you.html' : 'error.html');
