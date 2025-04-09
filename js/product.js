$(document).ready(function() {
    // Xử lý form thêm mặt hàng
    $('#add-product-form').submit(function(e) {
        e.preventDefault(); // Ngăn form submit theo cách thông thường
        
        // Lấy dữ liệu từ form
        const productName = $('#product-name').val();
        const productCategory = $('#product-category option:selected').text();
        const productPrice = $('#product-selling-price').val();
        const productQuantity = $('#product-quantity').val();
        
        // Tạo ID mới (trong thực tế, ID sẽ được tạo bởi backend)
        const newId = new Date().getTime();
        
        // Xác định trạng thái dựa trên số lượng
        let status = 'Còn hàng';
        let statusClass = 'label-success';
        
        if (productQuantity == 0) {
            status = 'Hết hàng';
            statusClass = 'label-danger';
        } else if (productQuantity <= 5) {
            status = 'Sắp hết';
            statusClass = 'label-warning';
        }
        
        // Tạo hàng mới cho bảng sản phẩm
        const newRow = `
            <tr>
                <td>${newId}</td>
                <td>${productName}</td>
                <td>${productCategory}</td>
                <td>${formatCurrency(productPrice)} đ</td>
                <td>${productQuantity}</td>
                <td><span class="label ${statusClass}">${status}</span></td>
                <td>
                    <a href="edit-product.html?id=${newId}" class="btn btn-sm btn-primary"><i class="fa-solid fa-edit"></i></a>
                    <a href="#" class="btn btn-sm btn-danger delete-product"><i class="fa-solid fa-trash"></i></a>
                </td>
            </tr>
        `;
        
        // Lưu dữ liệu vào localStorage
        saveProduct({
            id: newId,
            name: productName,
            category: productCategory,
            price: productPrice,
            quantity: productQuantity,
            status: status
        });
        
        // Lưu hoạt động gần đây
        saveActivity({
            id: new Date().getTime(),
            action: 'add',
            item: productName,
            time: new Date().toISOString()
        });
        
        // Thông báo thành công
        alert('Thêm mặt hàng thành công!');
        
        // Chuyển hướng về trang danh sách sản phẩm
        window.location.href = 'products.html';
    });
    
    // Hiển thị danh sách sản phẩm
    loadProducts();
    
    // Hiển thị hoạt động gần đây
    loadActivities();
    
    // Xử lý xóa sản phẩm
    $(document).on('click', '.delete-product', function(e) {
        e.preventDefault();
        
        if (confirm('Bạn có chắc chắn muốn xóa mặt hàng này?')) {
            const row = $(this).closest('tr');
            const id = row.find('td:first').text();
            
            // Xóa sản phẩm khỏi localStorage
            deleteProduct(id);
            
            // Lưu hoạt động gần đây
            saveActivity({
                id: new Date().getTime(),
                action: 'delete',
                item: row.find('td:eq(1)').text(),
                time: new Date().toISOString()
            });
            
            // Xóa hàng khỏi bảng
            row.remove();
        }
    });

    $('#search-input').on('input', function() {
        const searchTerm = $(this).val().toLowerCase();
        $('.product-table tbody tr').each(function() {
            const productName = $(this).find('td:eq(1)').text().toLowerCase();
            if (productName.includes(searchTerm)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    const rowsPerPage = 5;
    const rows = $('.product-table tbody tr');
    const totalRows = rows.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage);

    function showPage(page) {
        rows.hide();
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        rows.slice(start, end).show();
    }

    function createPagination() {
        const pagination = $('.pagination');
        pagination.empty();
        for (let i = 1; i <= totalPages; i++) {
            const pageItem = $('<li>').addClass(i === 1 ? 'active' : '').append(
                $('<a>').attr('href', '#').text(i).on('click', function(e) {
                    e.preventDefault();
                    pagination.find('li').removeClass('active');
                    $(this).parent().addClass('active');
                    showPage(i);
                })
            );
            pagination.append(pageItem);
        }
    }

    createPagination();
    showPage(1);

    const searchTerm = $(this).val().toLowerCase();
    rows.each(function() {
        const productName = $(this).find('td:eq(1)').text().toLowerCase();
        if (productName.includes(searchTerm)) {
            $(this).data('visible', true);
        } else {
            $(this).data('visible', false);
        }
    });
    
    // Hiển thị lại các dòng phù hợp với tìm kiếm và cập nhật phân trang
    updateVisibleRows();
});

function updateVisibleRows() {
    const visibleRows = rows.filter(function() {
        return $(this).data('visible') !== false;
    });
    
    // Cập nhật tổng số dòng và số trang
    totalRows = visibleRows.length;
    totalPages = Math.ceil(totalRows / rowsPerPage);
    
    createPagination(visibleRows);
    showPage(1, visibleRows);
}

function showPage(page, visibleRows) {
    visibleRows.hide();
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    visibleRows.slice(start, end).show();
}

function createPagination(visibleRows) {
    const pagination = $('.pagination');
    pagination.empty();
    
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = $('<li>').addClass(i === 1 ? 'active' : '').append(
            $('<a>').attr('href', '#').text(i).on('click', function(e) {
                e.preventDefault();
                pagination.find('li').removeClass('active');
                $(this).parent().addClass('active');
                showPage(i, visibleRows);
            })
        );
        pagination.append(pageItem);
    }
}


// Hàm định dạng tiền tệ
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN').format(amount);
}

// Hàm lưu sản phẩm vào localStorage
function saveProduct(product) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));
}

// Hàm xóa sản phẩm khỏi localStorage
function deleteProduct(id) {
    let products = JSON.parse(localStorage.getItem('products')) || [];
    products = products.filter(product => product.id != id);
    localStorage.setItem('products', JSON.stringify(products));
}

// Hàm tải danh sách sản phẩm từ localStorage
function loadProducts() {
    if (!$('.product-table').length) return; // Chỉ chạy khi ở trang products.html
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    const tableBody = $('.product-table tbody');
    
    // Xóa dữ liệu cũ
    tableBody.empty();
    
    // Thêm dữ liệu mới
    products.forEach(product => {
        let statusClass = 'label-success';
        if (product.status === 'Hết hàng') {
            statusClass = 'label-danger';
        } else if (product.status === 'Sắp hết') {
            statusClass = 'label-warning';
        }
        
        const row = `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)} đ</td>
                <td>${product.quantity}</td>
                <td><span class="label ${statusClass}">${product.status}</span></td>
                <td>
                    <a href="edit-product.html?id=${product.id}" class="btn btn-sm btn-primary"><i class="fa-solid fa-edit"></i></a>
                    <a href="#" class="btn btn-sm btn-danger delete-product"><i class="fa-solid fa-trash"></i></a>
                </td>
            </tr>
        `;
        
        tableBody.append(row);
    });
    
    // Cập nhật số lượng sản phẩm trên dashboard
    updateDashboardCount('products', products.length);
}

// Hàm lưu hoạt động gần đây
function saveActivity(activity) {
    let activities = JSON.parse(localStorage.getItem('activities')) || [];
    
    // Giới hạn số lượng hoạt động lưu trữ (giữ 10 hoạt động gần nhất)
    if (activities.length >= 10) {
        activities.pop(); // Xóa hoạt động cũ nhất
    }
    
    // Thêm hoạt động mới vào đầu mảng
    activities.unshift(activity);
    
    localStorage.setItem('activities', JSON.stringify(activities));
}

// Hàm tải hoạt động gần đây
function loadActivities() {
    if (!$('.recent-activities').length) return; // Chỉ chạy khi có phần tử hiển thị hoạt động
    
    const activities = JSON.parse(localStorage.getItem('activities')) || [];
    const activityList = $('.recent-activities');
    
    // Xóa dữ liệu cũ
    activityList.empty();
    
    // Thêm dữ liệu mới
    activities.forEach(activity => {
        let icon = 'fa-plus';
        let actionText = 'Thêm sản phẩm mới: ';
        
        if (activity.action === 'delete') {
            icon = 'fa-trash';
            actionText = 'Xóa sản phẩm: ';
        } else if (activity.action === 'edit') {
            icon = 'fa-edit';
            actionText = 'Cập nhật sản phẩm: ';
        }
        
        const timeAgo = getTimeAgo(new Date(activity.time));
        
        const item = `
            <a href="#" class="list-group-item">
                <span class="badge">${timeAgo}</span>
                <i class="fa-solid ${icon}"></i> ${actionText}${activity.item}
            </a>
        `;
        
        activityList.append(item);
    });
}

// Hàm tính thời gian tương đối
function getTimeAgo(date) {
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);
    
    if (diffSec < 60) {
        return 'vừa xong';
    } else if (diffMin < 60) {
        return `${diffMin} phút trước`;
    } else if (diffHour < 24) {
        return `${diffHour} giờ trước`;
    } else if (diffDay === 1) {
        return 'hôm qua';
    } else {
        return `${diffDay} ngày trước`;
    }
}

// Cập nhật số lượng hiển thị trên dashboard
function updateDashboardCount(type, count) {
    if (!$('.dashboard-stats').length) return; // Chỉ chạy khi ở trang dashboard
    
    switch(type) {
        case 'products':
            $('.product-count').text(count);
            break;
        case 'suppliers':
            $('.supplier-count').text(count);
            break;
        case 'warehouses':
            $('.warehouse-count').text(count);
            break;
        case 'low-stock':
            $('.low-stock-count').text(count);
            break;
    }
}
