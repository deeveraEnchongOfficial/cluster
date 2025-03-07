<?php

namespace App\Modules\Acumatica\Transaction;

enum TransactionStatus: string
{
    case QUEUED = 'queued';
    case PROCESSING = 'processing';
    case SYNCHRONIZING = 'synchronizing';
    case COMPLETED = 'completed';
    case FAILED = 'failed';
}
