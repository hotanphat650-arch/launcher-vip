package com.samp.online.launcher.activities;

import android.Manifest;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.google.firebase.messaging.FirebaseMessaging;
import com.liulishuo.filedownloader.FileDownloader;
import com.samp.online.App;
import com.samp.online.R;
import com.samp.online.Utils;
import com.samp.online.launcher.Preferences;

import java.util.List;

import es.dmoral.toasty.Toasty;
import pub.devrel.easypermissions.EasyPermissions;

public class SplashActivity extends AppCompatActivity implements EasyPermissions.PermissionCallbacks {
    
    // permissions
    private static final int MAIN_PERMISSIONS_REQUEST_CODE = 300;
    private Handler handler;
    String[] main_permissions = {
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.READ_EXTERNAL_STORAGE,
            Manifest.permission.RECORD_AUDIO
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        handler = new Handler();
        
        if (EasyPermissions.hasPermissions(this, main_permissions)) {
            Utils.writeLog(this, 'i', "app sucessfully started!");
            Init();
        } else {
            Utils.writeLog(this, 'i', "app not have full permissions!!!");
            EasyPermissions.requestPermissions(this,
                    "Ứng dụng phải có quyền ghi vào bộ nhớ.",
                    MAIN_PERMISSIONS_REQUEST_CODE, main_permissions);
        }
    }

    private void Init() {
        FileDownloader.setup(this);
        
        if (!Preferences.getBoolean(this, Preferences.FIRST_START)) {
            FirebaseMessaging.getInstance().getToken().addOnCompleteListener(task -> {
                if (!task.isSuccessful()) {
                    Utils.writeLog(SplashActivity.this, 'e', "FCM Reg failed: " + task.getException());
                    return;
                }
                Preferences.putString(App.getInstance(), Preferences.USER_FCM_KEY, task.getResult());
                Utils.writeLog(SplashActivity.this, 'i', "FCM reg success! Token: " + task.getResult());
            });
            Preferences.putBoolean(SplashActivity.this, Preferences.FIRST_START, true);
        }
        
        // Bỏ loadAPI(), gọi thẳng hàm khởi chạy giao diện
        startLauncher();
    }

    //-------------------------------------------------------------------

    private void startLauncher() {
        // Đã xóa phần check phiên bản từ Server API

        handler.postDelayed(() -> {
            System.out.println("Debug: Bắt đầu chuyển màn hình");
            Intent intent = new Intent(this, MainActivity.class);
            
            if (Preferences.getString(App.getInstance(), Preferences.NICKNAME).isEmpty()) {
                System.out.println("Debug 1: Chưa có NICKNAME");
                // Nếu muốn chuyển hướng đến màn hình đăng ký/nhập tên, hãy thay MainActivity.class bằng StartActivity.class
                intent = new Intent(this, MainActivity.class);
            }
            
            intent.putExtras(getIntent());
            startActivity(intent);
            finish();
        }, 3000); // Đã giảm từ 5000 (5 giây) xuống 3000 (3 giây) để vào game nhanh hơn, bạn có thể chỉnh lại nếu muốn.
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        EasyPermissions.onRequestPermissionsResult(requestCode, permissions, grantResults, this);
    }

    @Override
    public void onPermissionsGranted(int requestCode, List<String> list) {
        if (requestCode == MAIN_PERMISSIONS_REQUEST_CODE) {
            Init();
        }
    }

    @Override
    public void onPermissionsDenied(int requestCode, List<String> list) {
        if (requestCode == MAIN_PERMISSIONS_REQUEST_CODE) {
            Utils.writeLog(SplashActivity.this, 'i', "Lỗi ủy quyền");
            Toasty.error(SplashActivity.this, "Ứng dụng được yêu cầu phải có tất cả các quyền được yêu cầu.!!!", Toast.LENGTH_LONG).show();
            // Nếu không cấp quyền thì app không chạy được, nên để finish() hoặc thông báo rõ cho người dùng
            // finish();
        }
    }
}
